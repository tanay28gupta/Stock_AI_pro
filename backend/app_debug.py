from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from huggingface_hub import InferenceClient
from datetime import datetime
import mysql.connector
from portfolio_utils import get_all_portfolio_ids, get_unique_tickers_by_portfolio
from save_utils import (
    delete_sentiment_scores_only,
    save_article_to_db,
    save_average_sentiment,
    save_final_portfolio_sentiment
)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

from config import HUGGINGFACE_TOKEN, NEWS_API_KEY, NEWS_API_URL, validate_config

# Validate configuration
validate_config()

# Initialize FinBERT client with error handling
try:
    finbert_client = InferenceClient(model="ProsusAI/finbert", token=HUGGINGFACE_TOKEN)
    print("✅ FinBERT client initialized successfully")
except Exception as e:
    print(f"❌ Error initializing FinBERT client: {e}")
    finbert_client = None

processed_stocks = {}  # To avoid duplicate sentiment fetches

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="tanay282004",
        database="stock_trading_app"
    )

def fetch_news(query, page_size=5):
    try:
        params = {
            'q': query,
            'language': 'en',
            'sortBy': 'relevancy',
            'pageSize': page_size,
            'apiKey': NEWS_API_KEY
        }
        response = requests.get(NEWS_API_URL, params=params)
        if response.status_code != 200:
            print(f"❌ News API error: {response.status_code} - {response.text}")
            raise RuntimeError(f"News fetch failed: {response.status_code} — {response.text}")
        articles = response.json().get('articles', [])
        print(f"✅ Fetched {len(articles)} articles for '{query}'")
        return articles
    except Exception as e:
        print(f"❌ Error fetching news for '{query}': {e}")
        return []

def analyze_sentiment(text):
    if not text or text.strip() == "":
        return []
    
    if finbert_client is None:
        print("❌ FinBERT client not available")
        return []
    
    try:
        result = finbert_client.text_classification(text)
        print(f"✅ Sentiment analysis completed for text: {text[:50]}...")
        return result
    except Exception as e:
        print(f"❌ Error in sentiment analysis: {e}")
        return []

def compute_scalar_score(result):
    if not result:
        return 0.0
    
    score_map = {'positive': 0.0, 'neutral': 0.0, 'negative': 0.0}
    for item in result:
        label = item['label'].lower()
        if label in score_map:
            score_map[label] = item['score']
    score = round(score_map['positive'] - score_map['negative'], 4)
    print(f"📊 Computed score: {score} (pos: {score_map['positive']}, neg: {score_map['negative']})")
    return score

def compute_average_sentiment(scores):
    if not scores:
        return 0.0
    avg = round(sum(scores) / len(scores), 4)
    print(f"📈 Average sentiment: {avg} from {len(scores)} scores")
    return avg

@app.route('/api/test-sentiment', methods=['GET'])
def test_sentiment():
    """Test endpoint to verify sentiment analysis is working"""
    try:
        test_text = "Apple stock is performing well with strong earnings growth."
        print(f"🧪 Testing sentiment analysis with: {test_text}")
        
        result = analyze_sentiment(test_text)
        if result:
            score = compute_scalar_score(result)
            return jsonify({
                'success': True,
                'test_text': test_text,
                'sentiment_result': result,
                'score': score,
                'message': 'Sentiment analysis is working'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Sentiment analysis returned empty result'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/test-news', methods=['GET'])
def test_news():
    """Test endpoint to verify news API is working"""
    try:
        test_query = "AAPL stock"
        print(f"🧪 Testing news API with: {test_query}")
        
        articles = fetch_news(test_query, page_size=3)
        if articles:
            return jsonify({
                'success': True,
                'query': test_query,
                'articles_count': len(articles),
                'sample_article': {
                    'title': articles[0].get('title', 'No title'),
                    'description': articles[0].get('description', 'No description')[:100] + '...'
                },
                'message': 'News API is working'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No articles returned from News API'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/save-portfolios', methods=['POST'])
def save_portfolios():
    try:
        data = request.json
        portfolios = data.get('portfolios', [])
        user_id = data.get('user_id', 1)
        
        print(f"💾 Saving {len(portfolios)} portfolios for user {user_id}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Clear existing portfolios for this user
        cursor.execute("DELETE FROM stock WHERE portfolio_id IN (SELECT portfolio_id FROM portfolio WHERE user_id = %s)", (user_id,))
        cursor.execute("DELETE FROM portfolio WHERE user_id = %s", (user_id,))
        
        for portfolio in portfolios:
            # Insert portfolio
            cursor.execute(
                "INSERT INTO portfolio (user_id, portfolio_name) VALUES (%s, %s)",
                (user_id, portfolio['name'])
            )
            portfolio_id = cursor.lastrowid
            print(f"📁 Created portfolio: {portfolio['name']} (ID: {portfolio_id})")
            
            # Insert stocks
            for stock in portfolio['stocks']:
                cursor.execute(
                    "INSERT INTO stock (portfolio_id, stock_ticker, stock_name) VALUES (%s, %s, %s)",
                    (portfolio_id, stock['ticker'], stock['name'])
                )
                print(f"📈 Added stock: {stock['ticker']} ({stock['name']})")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ Successfully saved {len(portfolios)} portfolios")
        
        return jsonify({
            'success': True,
            'message': f'Successfully saved {len(portfolios)} portfolios',
            'user_id': user_id
        })
        
    except Exception as e:
        print(f"❌ Error saving portfolios: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze-portfolios/<int:user_id>', methods=['POST'])
def analyze_portfolios(user_id):
    try:
        print(f"🔍 Starting analysis for user {user_id}")
        
        # Get all portfolio IDs for the user
        portfolio_ids = get_all_portfolio_ids(user_id)
        print(f"📋 Found portfolios: {portfolio_ids}")
        
        if not portfolio_ids:
            return jsonify({
                'success': False,
                'error': 'No portfolios found for this user'
            }), 404
        
        results = []
        
        for portfolio_id in portfolio_ids:
            print(f"\n🔁 Processing Portfolio ID: {portfolio_id}")
            delete_sentiment_scores_only(portfolio_id)
            
            tickers = get_unique_tickers_by_portfolio(portfolio_id)
            print(f"📥 Portfolio {portfolio_id} Stocks: {tickers}")
            overall_scores = []
            stock_results = []
            
            for stock in tickers:
                if stock in processed_stocks:
                    reused_score = processed_stocks[stock]
                    print(f"🔁 Reusing sentiment for {stock}: {reused_score}")
                    save_average_sentiment(portfolio_id, stock, reused_score)
                    overall_scores.append(reused_score)
                    stock_results.append({
                        'ticker': stock,
                        'sentiment': reused_score
                    })
                    continue
                
                try:
                    print(f"📊 Fetching news for {stock}...")
                    articles = fetch_news(stock + " stock")
                    print(f"📄 {len(articles)} articles found for {stock}")
                    stock_scores = []
                    
                    if not articles:
                        print(f"⚠️ No articles found for {stock}, using default score")
                        stock_scores = [0.0]
                    else:
                        for article in articles:
                            title = article.get('title', 'No title')
                            description = article.get('description', '')
                            url = article.get('url', '')
                            raw_time = article.get('publishedAt', '')
                            
                            try:
                                published_at = datetime.strptime(raw_time, '%Y-%m-%dT%H:%M:%SZ').strftime('%Y-%m-%d %H:%M:%S')
                            except:
                                published_at = None
                            
                            if description:
                                result = analyze_sentiment(description)
                                scalar_score = compute_scalar_score(result)
                                stock_scores.append(scalar_score)
                                
                                try:
                                    print(f"📝 Saving article: {title[:40]}... → Score: {scalar_score}")
                                    save_article_to_db(stock, title, description, url, scalar_score, published_at)
                                except Exception as e:
                                    print(f"❌ Error saving article: {e}")
                    
                    avg_score = compute_average_sentiment(stock_scores)
                    processed_stocks[stock] = avg_score
                    save_average_sentiment(portfolio_id, stock, avg_score)
                    overall_scores.extend(stock_scores)
                    stock_results.append({
                        'ticker': stock,
                        'sentiment': avg_score
                    })
                    print(f"✅ Avg Sentiment for {stock}: {avg_score}")
                    
                except Exception as e:
                    print(f"❌ Error for stock {stock}: {e}")
                    stock_results.append({
                        'ticker': stock,
                        'sentiment': 0.0
                    })
            
            final_avg = compute_average_sentiment(overall_scores)
            save_final_portfolio_sentiment(portfolio_id, final_avg)
            
            # Get portfolio name
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT portfolio_name FROM portfolio WHERE portfolio_id = %s", (portfolio_id,))
            portfolio_name = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            
            results.append({
                'portfolio_id': portfolio_id,
                'portfolio_name': portfolio_name,
                'avg_score': final_avg,
                'stocks': stock_results
            })
            
            print(f"🎯 Final Sentiment for Portfolio {portfolio_id}: {final_avg}")
        
        print(f"✅ Analysis completed successfully for {len(results)} portfolios")
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/get-portfolios/<int:user_id>', methods=['GET'])
def get_portfolios(user_id):
    try:
        print(f"📊 Fetching portfolios for user {user_id}")
        
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get portfolios with sentiment scores
        cursor.execute("""
            SELECT portfolio_id, portfolio_name, avg_port_sent_score 
            FROM portfolio 
            WHERE user_id = %s
        """, (user_id,))
        portfolios = cursor.fetchall()
        
        results = []
        for portfolio in portfolios:
            # Get stocks for this portfolio
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
        
        print(f"✅ Retrieved {len(results)} portfolios")
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        print(f"❌ Error fetching portfolios: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Backend API is running',
        'finbert_available': finbert_client is not None,
        'news_api_key': 'configured' if NEWS_API_KEY else 'missing',
        'finbert_token': 'configured' if FINBERT_TOKEN else 'missing'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000) 