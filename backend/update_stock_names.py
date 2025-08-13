import requests
from db import get_connection
from config import FINNHUB_API_KEY, FINNHUB_BASE_URL

API_KEY = FINNHUB_API_KEY
BASE_URL = FINNHUB_BASE_URL

def get_company_name(symbol):
    url = f"{BASE_URL}/stock/profile2"
    params = {'symbol': symbol, 'token': API_KEY}
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json().get('name')
    except Exception as e:
        print(f"Error fetching name for {symbol}: {e}")
    return None

def update_missing_stock_names():
    conn = get_connection()
    cur = conn.cursor()
    # Find all stocks with missing or empty stock_name
    cur.execute("SELECT portfolio_id, stock_ticker FROM stock WHERE stock_name IS NULL OR stock_name = ''")
    rows = cur.fetchall()
    print(f"Found {len(rows)} stocks with missing names.")
    for portfolio_id, ticker in rows:
        name = get_company_name(ticker)
        if name:
            cur.execute("UPDATE stock SET stock_name=%s WHERE portfolio_id=%s AND stock_ticker=%s", (name, portfolio_id, ticker))
            print(f"Updated {ticker} in portfolio {portfolio_id} to '{name}'")
        else:
            print(f"Could not find name for {ticker} (portfolio {portfolio_id})")
    conn.commit()
    cur.close()
    conn.close()
    print("Done updating stock names.")

if __name__ == "__main__":
    update_missing_stock_names() 