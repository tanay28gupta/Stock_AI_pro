from db import get_connection

def get_all_portfolio_ids(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT portfolio_id FROM portfolio WHERE user_id = %s", (user_id,))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return [row[0] for row in results]

def get_unique_tickers_by_portfolio(portfolio_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT stock_ticker FROM stock 
        WHERE portfolio_id = %s
    """, (portfolio_id,))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return [row[0] for row in results]
