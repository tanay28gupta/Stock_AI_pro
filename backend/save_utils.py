from db import get_connection

def delete_sentiment_scores_only(portfolio_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE stock SET avg_stock_sent_score = NULL WHERE portfolio_id = %s", (portfolio_id,))
    cursor.execute("UPDATE portfolio SET avg_port_sent_score = NULL WHERE portfolio_id = %s", (portfolio_id,))
    
    conn.commit()
    cursor.close()
    conn.close()

def save_article_to_db(stock_ticker, title, description, url, score, published_at):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT IGNORE INTO news (stock_ticker, title, description, url, sent_score, date_time)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (stock_ticker, title, description, url, score, published_at))
    conn.commit()
    cursor.close()
    conn.close()

def save_average_sentiment(portfolio_id, stock_ticker, avg_score):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE stock SET avg_stock_sent_score = %s 
        WHERE portfolio_id = %s AND stock_ticker = %s
    """, (avg_score, portfolio_id, stock_ticker))
    
    conn.commit()
    cursor.close()
    conn.close()

def save_final_portfolio_sentiment(portfolio_id, final_score):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE portfolio SET avg_port_sent_score = %s 
        WHERE portfolio_id = %s
    """, (final_score, portfolio_id))

    conn.commit()
    cursor.close()
    conn.close()