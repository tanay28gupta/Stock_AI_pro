import requests
from huggingface_hub import InferenceClient
from datetime import datetime
from config import HUGGINGFACE_TOKEN, NEWS_API_KEY, NEWS_API_URL, validate_config
from utils.news_utils import fetch_news
from utils.sentiment_utils import analyze_sentiment, compute_scalar_score, compute_average_sentiment
from portfolio_utils import get_all_portfolio_ids, get_unique_tickers_by_portfolio
from save_utils import (
    delete_sentiment_scores_only,
    save_article_to_db,
    save_average_sentiment,
    save_final_portfolio_sentiment
)

# Validate configuration
validate_config()

finbert_client = InferenceClient(model="ProsusAI/finbert", token=HUGGINGFACE_TOKEN)

processed_stocks = {}  # To avoid duplicate sentiment fetches

def compute_portfolio_sentiment(scores, num_shares):
    if not scores:
        print(f"[DEBUG] No scores provided for weighted sentiment calculation.")
        return 0.0
    sum_val = 0
    index = 0
    print(f"[DEBUG] Calculating weighted sentiment:")
    print(f"  Scores: {scores}")
    print(f"  Num Shares: {num_shares}")
    for score in scores:
        if(index >= len(num_shares)):
            break
        print(f"    Stock {index+1}: score={score}, shares={num_shares[index]}, contrib={num_shares[index] * score}")
        sum_val += num_shares[index] * score
        index += 1
    total_shares = sum(num_shares)
    print(f"  Weighted sum: {sum_val}, Total shares: {total_shares}")
    wavg = sum_val / total_shares if total_shares else 0.0
    print(f"  Weighted average sentiment: {wavg}")
    round(wavg, 4)
    return wavg

def process_portfolio(portfolio_id):
    print(f"\n🔁 Processing Portfolio ID: {portfolio_id}")
    delete_sentiment_scores_only(portfolio_id)
    tickers = get_unique_tickers_by_portfolio(portfolio_id)
    print(f"📥 Portfolio {portfolio_id} Stocks: {tickers}")
    overall_scores = []
    num_shares = []
    # Fetch num_shares for all tickers in this portfolio
    from utils.db_utils import get_connection
    conn = get_connection()
    cur = conn.cursor()
    format_strings = ','.join(['%s'] * len(tickers))
    cur.execute(f"SELECT stock_ticker, num_shares FROM stock WHERE portfolio_id = %s AND stock_ticker IN ({format_strings})", [portfolio_id] + tickers)
    shares_dict = {row[0]: row[1] for row in cur.fetchall()}
    cur.close()
    conn.close()
    for stock in tickers:
        num_shares.append(shares_dict.get(stock, 1))
        if stock in processed_stocks:
            reused_score = processed_stocks[stock]
            print(f"🔁 Reusing sentiment for {stock}")
            save_average_sentiment(portfolio_id, stock, reused_score)
            overall_scores.append(reused_score)
            continue
        try:
            print(f"📊 Fetching news for {stock}...")
            articles = fetch_news(stock + " stock")
            print(f"📄 {len(articles)} articles found for {stock}")
            stock_scores = []
            for article in articles:
                title = article.get('title', 'No title')
                description = article.get('description', '')
                url = article.get('url', '')
                raw_time = article.get('publishedAt', '')
                try:
                    published_at = None
                    if raw_time:
                        from datetime import datetime
                        published_at = datetime.strptime(raw_time, '%Y-%m-%dT%H:%M:%SZ').strftime('%Y-%m-%d %H:%M:%S')
                except:
                    published_at = None
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
            overall_scores.append(avg_score)
            print(f"✅ Avg Sentiment for {stock}: {avg_score}")
        except Exception as e:
            print(f"❌ Error for stock {stock}: {e}")
    print(f"[DEBUG] Using weighted average for final portfolio sentiment.")
    final_avg = compute_portfolio_sentiment(overall_scores, num_shares)
    save_final_portfolio_sentiment(portfolio_id, final_avg)
    print(f"🎯 Final Sentiment for Portfolio {portfolio_id}: {final_avg}")

def analyze_portfolios_for_api(user_id=1):
    global processed_stocks
    processed_stocks = {}  # Reset cache for each run
    portfolio_ids = get_all_portfolio_ids(user_id)
    print(f"🧾 Found portfolios: {portfolio_ids}")
    results = []
    for portfolio_id in portfolio_ids:
        print(f"\n🔁 Processing Portfolio ID: {portfolio_id}")
        delete_sentiment_scores_only(portfolio_id)
        tickers = get_unique_tickers_by_portfolio(portfolio_id)
        print(f"📥 Portfolio {portfolio_id} Stocks: {tickers}")
        overall_scores = []
        num_shares = []
        stock_results = []
        # Fetch num_shares for all tickers in this portfolio
        from utils.db_utils import get_connection
        conn = get_connection()
        cur = conn.cursor()
        format_strings = ','.join(['%s'] * len(tickers))
        cur.execute(f"SELECT stock_ticker, num_shares FROM stock WHERE portfolio_id = %s AND stock_ticker IN ({format_strings})", [portfolio_id] + tickers)
        shares_dict = {row[0]: row[1] for row in cur.fetchall()}
        cur.close()
        conn.close()
        for stock in tickers:
            num_shares.append(shares_dict.get(stock, 1))
            if stock in processed_stocks:
                reused_score = processed_stocks[stock]
                print(f"🔁 Reusing sentiment for {stock}")
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
                for article in articles:
                    title = article.get('title', 'No title')
                    description = article.get('description', '')
                    url = article.get('url', '')
                    raw_time = article.get('publishedAt', '')
                    try:
                        published_at = None
                        if raw_time:
                            from datetime import datetime
                            published_at = datetime.strptime(raw_time, '%Y-%m-%dT%H:%M:%SZ').strftime('%Y-%m-%d %H:%M:%S')
                    except:
                        published_at = None
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
                overall_scores.append(avg_score)
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
        print(f"[DEBUG] Using weighted average for final portfolio sentiment.")
        final_avg = compute_portfolio_sentiment(overall_scores, num_shares)
        save_final_portfolio_sentiment(portfolio_id, final_avg)
        # Get portfolio name
        from utils.db_utils import get_connection
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
    return results

def main(user_id=1):
    global processed_stocks
    processed_stocks = {}  # Reset cache for each run
    portfolio_ids = get_all_portfolio_ids(user_id)
    print(f"🧾 Found portfolios: {portfolio_ids}")
    for pid in portfolio_ids:
        process_portfolio(pid)

if __name__ == "__main__":
    main()
