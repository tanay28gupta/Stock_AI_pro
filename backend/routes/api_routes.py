from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
import threading
import os
import sys
from portfolio_utils import get_all_portfolio_ids, get_unique_tickers_by_portfolio
from save_utils import (
    delete_sentiment_scores_only,
    save_article_to_db,
    save_average_sentiment,
    save_final_portfolio_sentiment
)
from main import analyze_portfolios_for_api
from QRE_new import main as run_qre_new
from utils.db_utils import get_connection
from utils.news_utils import fetch_news
from utils.sentiment_utils import analyze_sentiment, compute_scalar_score, compute_average_sentiment

api_bp = Blueprint('api', __name__)

# Global locks for QRE
qre_locks = {}
qre_locks_lock = threading.Lock()
processed_stocks = {}

@api_bp.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({
        'success': True,
        'message': 'Backend connection successful!',
        'timestamp': datetime.now().isoformat()
    })

@api_bp.route('/api/save-portfolios', methods=['POST'])
def save_portfolios():
    try:
        data = request.json
        portfolios = data.get('portfolios', [])
        user_id = data.get('user_id', 1)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT portfolio_id FROM portfolio WHERE user_id = %s", (user_id,))
        old_portfolio_ids = [row[0] for row in cursor.fetchall()]
        if old_portfolio_ids:
            cursor.execute("""
                SELECT stock_ticker FROM stock 
                WHERE portfolio_id IN ({})
            """.format(','.join(['%s'] * len(old_portfolio_ids))), old_portfolio_ids)
            old_stock_tickers = [row[0] for row in cursor.fetchall()]
            if old_stock_tickers:
                cursor.execute("""
                    DELETE FROM news 
                    WHERE stock_ticker IN ({})
                """.format(','.join(['%s'] * len(old_stock_tickers))), old_stock_tickers)
            cursor.execute("""
                DELETE FROM stock 
                WHERE portfolio_id IN ({})
            """.format(','.join(['%s'] * len(old_portfolio_ids))), old_portfolio_ids)
            cursor.execute("DELETE FROM portfolio WHERE user_id = %s", (user_id,))
        for portfolio in portfolios:
            cursor.execute(
                "INSERT INTO portfolio (user_id, portfolio_name) VALUES (%s, %s)",
                (user_id, portfolio['name'])
            )
            portfolio_id = cursor.lastrowid
            for stock in portfolio['stocks']:
                # Ensure shares is an integer and handle empty/invalid values
                try:
                    num_shares = int(stock.get('shares', 0))
                except (ValueError, TypeError):
                    num_shares = 0
                print(f"Inserting stock: {stock['ticker']}, shares: {stock.get('shares')}, num_shares: {num_shares}")
                cursor.execute(
                    "INSERT INTO stock (portfolio_id, stock_ticker, stock_name, num_shares) VALUES (%s, %s, %s, %s)",
                    (portfolio_id, stock['ticker'], stock['name'], num_shares)
                )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({
            'success': True,
            'message': f'Successfully saved {len(portfolios)} portfolios',
            'user_id': user_id
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/api/analyze-portfolios/<int:user_id>', methods=['POST'])
def analyze_portfolios(user_id):
    try:
        results = analyze_portfolios_for_api(user_id)
        return jsonify({'success': True, 'data': results})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/api/get-portfolios/<int:user_id>', methods=['GET'])
def get_portfolios(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT portfolio_id, portfolio_name, avg_port_sent_score 
            FROM portfolio 
            WHERE user_id = %s
        """, (user_id,))
        portfolios = cursor.fetchall()
        results = []
        for portfolio in portfolios:
            cursor.execute("""
                SELECT stock_ticker, stock_name, avg_stock_sent_score 
                FROM stock 
                WHERE portfolio_id = %s
            """, (portfolio['portfolio_id'],))
            stocks = cursor.fetchall()
            results.append({
                'portfolio_id': portfolio['portfolio_id'],
                'portfolio_name': portfolio['portfolio_name'],
                'avg_score': portfolio['avg_port_sent_score'] or 0.0,
                'stocks': [
                    {
                        'ticker': stock['stock_ticker'],
                        'sentiment': stock['avg_stock_sent_score'] or 0.0
                    }
                    for stock in stocks
                ]
            })
        cursor.close()
        conn.close()
        return jsonify({
            'success': True,
            'data': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/api/recommendations/<int:user_id>', methods=['POST'])
def get_recommendations(user_id):
    from portfolio_utils import get_all_portfolio_ids
    portfolio_ids = get_all_portfolio_ids(user_id)
    with qre_locks_lock:
        if user_id not in qre_locks:
            qre_locks[user_id] = threading.Lock()
        user_lock = qre_locks[user_id]
    acquired = user_lock.acquire(blocking=False)
    if not acquired:
        return jsonify({'success': False, 'error': 'QRE is already running for this user. Please wait.'}), 429
    try:
        run_qre_new(user_id)
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT DISTINCT r.*, p.portfolio_name
            FROM recommendation r
            JOIN portfolio p ON r.portfolio_id = p.portfolio_id
            WHERE r.portfolio_id IN (SELECT portfolio_id FROM portfolio WHERE user_id = %s)
        """, (user_id,))
        recommendations = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'recommendations': recommendations})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        user_lock.release()

@api_bp.route('/api/health', methods=['GET'])
def health_check():
    from utils.sentiment_utils import finbert_client
    from utils.news_utils import NEWS_API_KEY
    from utils.sentiment_utils import FINBERT_TOKEN
    return jsonify({
        'status': 'healthy',
        'message': 'Backend API is running',
        'finbert_available': finbert_client is not None,
        'news_api_key': 'configured' if NEWS_API_KEY else 'missing',
        'finbert_token': 'configured' if FINBERT_TOKEN else 'missing'
    })

@api_bp.route('/api/clear-all-data/<int:user_id>', methods=['DELETE'])
def clear_all_data(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT portfolio_id FROM portfolio WHERE user_id = %s", (user_id,))
        portfolio_ids = [row[0] for row in cursor.fetchall()]
        if portfolio_ids:
            cursor.execute("""
                SELECT stock_ticker FROM stock 
                WHERE portfolio_id IN ({})
            """.format(','.join(['%s'] * len(portfolio_ids))), portfolio_ids)
            stock_tickers = [row[0] for row in cursor.fetchall()]
            if stock_tickers:
                cursor.execute("""
                    DELETE FROM news 
                    WHERE stock_ticker IN ({})
                """.format(','.join(['%s'] * len(stock_tickers))), stock_tickers)
            cursor.execute("""
                DELETE FROM stock 
                WHERE portfolio_id IN ({})
            """.format(','.join(['%s'] * len(portfolio_ids))), portfolio_ids)
            cursor.execute("DELETE FROM portfolio WHERE user_id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        processed_stocks.clear()
        return jsonify({
            'success': True,
            'message': f'Successfully cleared all data for user {user_id}'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 

@api_bp.route('/api/news/<stock_ticker>', methods=['GET', 'OPTIONS'])
def get_news_for_stock(stock_ticker):
    """Fetch news articles for a given stock ticker from the news table."""
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return resp
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT title, url, sent_score, date_time
            FROM news
            WHERE stock_ticker = %s
            ORDER BY date_time DESC, news_id DESC
            LIMIT 20
        """, (stock_ticker,))
        articles = cursor.fetchall()
        cursor.close()
        conn.close()
        resp = make_response(jsonify({
            'success': True,
            'articles': articles
        }))
        resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        return resp
    except Exception as e:
        resp = make_response(jsonify({
            'success': False,
            'error': str(e)
        }), 500)
        resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        return resp 