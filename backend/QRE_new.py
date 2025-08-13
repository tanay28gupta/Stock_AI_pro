import requests
import time
from db import get_connection
from portfolio_utils import get_all_portfolio_ids, get_unique_tickers_by_portfolio
import mysql.connector
from config import FINNHUB_API_KEY, FMP_API_KEY, FINNHUB_BASE_URL, FMP_PROFILE_URL

API_KEY = FINNHUB_API_KEY
BASE_URL = FINNHUB_BASE_URL

# --- DB Helper Functions ---
def update_stock_beta_marketcap(portfolio_id, ticker, beta, market_cap):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE stock SET beta=%s, market_cap=%s WHERE portfolio_id=%s AND stock_ticker=%s", (beta, market_cap, portfolio_id, ticker))
    conn.commit()
    cur.close()
    conn.close()

def update_portfolio_ranges(portfolio_id, min_beta, max_beta, min_market_cap, max_market_cap):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE portfolio SET min_beta=%s, max_beta=%s, min_market_cap=%s, max_market_cap=%s WHERE portfolio_id=%s", (min_beta, max_beta, min_market_cap, max_market_cap, portfolio_id))
    conn.commit()
    cur.close()
    conn.close()

def clear_recommendations(portfolio_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM recommendation WHERE portfolio_id=%s", (portfolio_id,))
    conn.commit()
    cur.close()
    conn.close()

def insert_recommendation(portfolio_id, ticker, beta, market_cap, eps, pe_ratio, company_name):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO recommendation (portfolio_id, stock_ticker, beta, market_cap, eps, pe_ratio, company_name) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (portfolio_id, ticker, beta, market_cap, eps, pe_ratio, company_name)
        )
        conn.commit()
    except mysql.connector.IntegrityError:
        print(f"Duplicate recommendation for ({portfolio_id}, {ticker}) skipped.")
    finally:
        cur.close()
        conn.close()

def get_stock_name_from_db(portfolio_id, ticker):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT stock_name FROM stock WHERE portfolio_id = %s AND stock_ticker = %s LIMIT 1", (portfolio_id, ticker))
    result = cur.fetchone()
    cur.close()
    conn.close()
    return result[0] if result else None

# --- Existing QRE Functions (unchanged) ---
def get_beta(symbol):
    url = f"{BASE_URL}/stock/metric"
    params = {'symbol': symbol, 'metric': 'all', 'token': API_KEY}
    try:
        response = requests.get(url, params=params, timeout=10)
    except Exception as e:
        print(f"[QRE] get_beta: Exception for {symbol}: {e}")
        return None
    if response.status_code != 200:
        print(f"[QRE] get_beta: Bad status {response.status_code} for {symbol}")
        return None
    return response.json().get('metric', {}).get('beta')

def get_market_cap(symbol):
    url = f"{BASE_URL}/stock/metric"
    params = {'symbol': symbol, 'metric': 'all', 'token': API_KEY}
    try:
        response = requests.get(url, params=params, timeout=10)
    except Exception as e:
        print(f"[QRE] get_market_cap: Exception for {symbol}: {e}")
        return None
    if response.status_code != 200:
        print(f"[QRE] get_market_cap: Bad status {response.status_code} for {symbol}")
        return None
    market_cap_million = response.json().get('metric', {}).get('marketCapitalization')
    if market_cap_million is None:
        print(f"[QRE] get_market_cap: No market cap for {symbol}")
        return None
    return market_cap_million * 1_000_000  # Convert to absolute USD

def get_all_us_tickers():
    url = f"{BASE_URL}/stock/symbol"
    params = {'exchange': 'US', 'token': API_KEY}
    try:
        response = requests.get(url, params=params, timeout=10)
    except Exception as e:
        print(f"[QRE] get_all_us_tickers: Exception: {e}")
        raise
    if response.status_code != 200:
        print(f"[QRE] get_all_us_tickers: Bad status {response.status_code}")
        raise Exception(f"Failed to get US tickers: {response.status_code}")
    return [item['symbol'] for item in response.json() if 'symbol' in item]

def get_reference_ranges_old(base_tickers):
    betas = []
    market_caps = []
    for symbol in base_tickers:
        beta = get_beta(symbol)
        market_cap = get_market_cap(symbol)
        if beta is not None:
            betas.append(beta)
        if market_cap is not None:
            market_caps.append(market_cap)
    return min(betas), max(betas), min(market_caps), max(market_caps)

def get_reference_ranges(beta_min, beta_max, marketcap_min, marketcap_max, num_shares, base_tickers):
    url = f"{BASE_URL}/stock/metric"
    print(f"[DEBUG] get_reference_ranges: beta_min={beta_min}, beta_max={beta_max}, marketcap_min={marketcap_min}, marketcap_max={marketcap_max}")
    print(f"[DEBUG] get_reference_ranges: num_shares={num_shares}, base_tickers={base_tickers}")
    weighted_betas = []
    weighted_market_caps = []
    index = 0
    for symbol in base_tickers:
        print(f"[DEBUG] Loop index={index}, symbol={symbol}, num_shares={num_shares}")
        if(index >= len(num_shares)):
            print(f"[ERROR] Index {index} out of range for num_shares (len={len(num_shares)})")
            break
        try:
            shares = float(num_shares[index])
        except Exception as e:
            print(f"[ERROR] Could not convert num_shares[{index}] to float: {num_shares[index]} ({e})")
            shares = 1
        
        params = {'symbol': symbol, 'metric': 'all', 'token': API_KEY}
        fail_flag = False
        try:
            response = requests.get(url, params=params, timeout=10)
        except Exception as e:
            print(f"[QRE] get_beta: Exception for {symbol}: {e}")
            fail_flag = True
        if response.status_code != 200:
            print(f"[QRE] get_beta: Bad status {response.status_code} for {symbol}")
            fail_flag = True
        if(not fail_flag):
            data = response.json().get('metric', {})
            beta_val = data.get('beta')
            market_cap_million = data.get('marketCapitalization')
            market_cap_val = market_cap_million * 1_000_000
        else:
            beta_val = None
            market_cap_val = None

        print(f"[DEBUG] shares={shares}, beta_val={beta_val}, market_cap_val={market_cap_val}")
        weighted_beta = shares * beta_val if beta_val is not None else None
        weighted_market_cap = shares * market_cap_val if market_cap_val is not None else None
        index += 1
        if weighted_beta is not None:
            weighted_betas.append(weighted_beta)
        if weighted_market_cap is not None:
            weighted_market_caps.append(weighted_market_cap)
    print(f"[DEBUG] weighted_betas={weighted_betas}, weighted_market_caps={weighted_market_caps}")
    total_shares = sum(float(shares) for shares in num_shares)
    print(f"[DEBUG] total_shares={total_shares}")
    wavg_beta = sum(weighted_betas) / total_shares if total_shares else 0
    wavg_market_cap = sum(weighted_market_caps) / total_shares if total_shares else 0
    print(f"[DEBUG] wavg_beta={wavg_beta}, wavg_market_cap={wavg_market_cap}")
    beta_range_min = 0
    beta_range_max = 0
    marketcap_range_min = 0
    marketcap_range_max = 0

    if(len(base_tickers) == 1):
        beta_range_min = wavg_beta * 0.8
        beta_range_max = wavg_beta * 1.2
        marketcap_range_min = wavg_market_cap * 0.7
        marketcap_range_max = wavg_market_cap * 1.3
        return beta_range_min, beta_range_max, marketcap_range_min, marketcap_range_max

    if(abs(wavg_beta - beta_max) > abs(wavg_beta - beta_min)):
        beta_range_min = beta_min
        beta_range_max = wavg_beta + abs(wavg_beta - beta_min)
        #Inflating max by 30%
        if beta_range_max * 1.2 <= beta_max:
            beta_range_max *= 1.2
        else:
            beta_range_max = beta_max
    else:
        beta_range_max = beta_max
        beta_range_min = wavg_beta - abs(beta_max - wavg_beta)
        #Deflating min by 30%
        if beta_range_min * 0.8 >= beta_min:
            beta_range_min *= 0.8
        else:
            beta_range_min = beta_min
    if(abs(wavg_market_cap - marketcap_max) > abs(wavg_market_cap - marketcap_min)):
        marketcap_range_min = marketcap_min
        marketcap_range_max = wavg_market_cap + abs(wavg_market_cap - marketcap_min)
        #Inflating max by 30%
        if marketcap_range_max * 1.3 <= marketcap_max:
            marketcap_range_max *= 1.3
        else:
            marketcap_range_max = marketcap_max
    else:
        marketcap_range_max = marketcap_max
        marketcap_range_min = wavg_market_cap - abs(marketcap_max - wavg_market_cap)
        #Deflating min by 30%
        if marketcap_range_min * 0.7 >= marketcap_min:
            marketcap_range_min *= 0.7
        else:
            marketcap_range_min = marketcap_min
    return beta_range_min, beta_range_max, marketcap_range_min, marketcap_range_max

def find_stocks_in_range(
    beta_min, beta_max,
    marketcap_min, marketcap_max,
    #base_tickers,
    max_results=10,
    exchange='NASDAQ',
    api_key='3EHPmW2y9saNG3kZxJInX30llXdjaaar'
):
    url = 'https://financialmodelingprep.com/api/v3/stock-screener'
    params = {
        'betaMoreThan': beta_min,
        'betaLowerThan': beta_max,
        'marketCapMoreThan': marketcap_min,
        'marketCapLowerThan': marketcap_max,
        'limit': max_results * 2,
        'exchange': exchange,
        'apikey': api_key
    }
    try:
        response = requests.get(url, params=params, timeout=10)
    except Exception as e:
        print(f"[QRE] find_stocks_in_range: Exception: {e}")
        raise
    if response.status_code != 200:
        print(f"[QRE] find_stocks_in_range: Bad status {response.status_code}")
        raise Exception(f"FMP API request failed: {response.status_code}")
    data = response.json()
    #base_set = set(base_tickers)
    filtered = []
    for stock in data:
        symbol = stock.get('symbol')
        beta = stock.get('beta')
        market_cap = stock.get('marketCap')

        if symbol and len(symbol) <= 4 and beta is not None and market_cap is not None:
            filtered.append({'symbol': symbol, 'beta': round(beta, 2), 'market_cap': round(market_cap, 2)})
        if len(filtered) >= max_results:
            break
    return filtered

def get_eps_finnhub(symbol, api_key):
    url = 'https://finnhub.io/api/v1/stock/metric'
    params = {
        'symbol': symbol,
        'metric': 'all',
        'token': api_key
    }
    try:
        response = requests.get(url, params=params, timeout=10)
    except Exception as e:
        print(f"[QRE] get_eps_finnhub: Exception for {symbol}: {e}")
        return None
    if response.status_code != 200:
        print(f"Finnhub EPS API error for {symbol}: {response.status_code} {response.text}")
        return None
    data = response.json().get('metric', {})
    eps = data.get('epsInclExtraItemsTTM') or data.get('epsTTM')
    if eps is None:
        print(f"Finnhub EPS missing for {symbol}. Full response: {response.json()}")
    return eps

def get_pe_finnhub(symbol, api_key):
    url = 'https://finnhub.io/api/v1/stock/metric'
    params = {
        'symbol': symbol,
        'metric': 'all',
        'token': api_key
    }
    try:
        response = requests.get(url, params=params, timeout=10)
    except Exception as e:
        print(f"[QRE] get_pe_finnhub: Exception for {symbol}: {e}")
        return None
    if response.status_code != 200:
        print(f"Finnhub PE API error for {symbol}: {response.status_code} {response.text}")
        return None
    data = response.json().get('metric', {})
    pe = data.get('peTTM') or data.get('peNormalizedAnnual')
    if pe is None:
        print(f"Finnhub PE missing for {symbol}. Full response: {response.json()}")
    return pe

def get_eps_and_pe_finnhub(stocks, api_key):
    enriched_stocks = []
    url = 'https://finnhub.io/api/v1/stock/metric'
    for stock in stocks:
        symbol = stock['symbol']
        params = {
            'symbol': symbol,
            'metric': 'all',
            'token': api_key
        }
        fail_flag = False
        try:
            response = requests.get(url, params=params, timeout=10)
        except Exception as e:
            print(f"[QRE] get_eps_and_pe_finnhub: Exception for {symbol}: {e}")
            fail_flag = True
        if response.status_code != 200:
            print(f"Finnhub EPS/PE API error for {symbol}: {response.status_code} {response.text}")
            fail_flag = True
        
        if not fail_flag:
            data = response.json().get('metric', {})
            eps = data.get('epsInclExtraItemsTTM') or data.get('epsTTM')
            pe = data.get('peTTM') or data.get('peNormalizedAnnual')
        else:
            eps = None
            pe = None

        if eps is None or pe is None:
            print(f"Skipping {symbol} (missing EPS or P/E)")
            continue
        enriched_stocks.append({
            'symbol': symbol,
            'beta': stock.get('beta'),
            'market_cap': stock.get('market_cap'),
            'eps': round(eps, 2),
            'pe_ratio': round(pe, 2)
        })
        time.sleep(0.05)
    return enriched_stocks

def suggest_top_stocks(stocks):
    def score(stock):
        return stock['eps'] / stock['pe_ratio']
    ranked = sorted(stocks, key=score, reverse=True)
    return ranked[:5]

def get_company_name(symbol):
    print(f"Calling Finnhub for {symbol}")
    url = f"{BASE_URL}/stock/profile2"
    params = {'symbol': symbol, 'token': API_KEY}
    response = requests.get(url, params=params)
    print(f"Response status: {response.status_code}")
    if response.status_code != 200:
        print(f"Error fetching company name for {symbol}: {response.status_code} {response.text}")
        return None
    print(f"API response for {symbol}: {response.json()}")
    return response.json().get('name')

# --- Main QRE Workflow ---
def main(user_id=1):
    print("=== QRE_new.py MAIN FUNCTION STARTED ===")
    portfolio_ids = get_all_portfolio_ids(user_id)
    print(f"[DEBUG] main: portfolio_ids={portfolio_ids}")
    for portfolio_id in portfolio_ids:
        print(f"\nProcessing Portfolio ID: {portfolio_id}")
        tickers = get_unique_tickers_by_portfolio(portfolio_id)
        print(f"Portfolio {portfolio_id} Stocks: {tickers}")
        # 1. Update stock table with beta and market cap
        betas = []
        market_caps = []

        #number of shares dummy stuff
        num_shares = []
        # Fetch num_shares for all tickers in this portfolio
        conn = get_connection()
        cur = conn.cursor()
        format_strings = ','.join(['%s'] * len(tickers))
        print(f"[DEBUG] main: format_strings={format_strings}, tickers={tickers}")
        cur.execute(f"SELECT stock_ticker, num_shares FROM stock WHERE portfolio_id = %s AND stock_ticker IN ({format_strings})", [portfolio_id] + tickers)
        shares_dict = {row[0]: row[1] for row in cur.fetchall()}
        print(f"[DEBUG] main: shares_dict={shares_dict}")
        cur.close()
        conn.close()
        url = f"{BASE_URL}/stock/metric"
        for ticker in tickers:
            shares = shares_dict.get(ticker, 1) # default to 1 if not found
            num_shares.append(shares)

            params = {'symbol': ticker, 'metric': 'all', 'token': API_KEY}
            fail_flag = False
            try:
                response = requests.get(url, params=params, timeout=10)
            except Exception as e:
                print(f"[QRE] get_beta: Exception for {ticker}: {e}")
                fail_flag = True
            if response.status_code != 200:
                print(f"[QRE] get_beta: Bad status {response.status_code} for {ticker}")
                fail_flag = True
            
            if not fail_flag:
                data = response.json().get('metric', {})
                beta = data.get('beta')
                market_cap_million = data.get('marketCapitalization')
                market_cap = market_cap_million * 1_000_000
            else:
                beta = None
                market_cap = None

            update_stock_beta_marketcap(portfolio_id, ticker, beta, market_cap)
            print(f"Updated {ticker}: beta={beta}, market_cap={market_cap}, num_shares={shares}")
            if beta is not None:
                betas.append(beta)
            if market_cap is not None:
                market_caps.append(market_cap)
            time.sleep(0.05)
        print(f"[DEBUG] main: num_shares={num_shares}, betas={betas}, market_caps={market_caps}")
        # 2. Calculate min/max and update portfolio table
        if betas and market_caps:
            min_beta, max_beta = min(betas), max(betas)
            min_market_cap, max_market_cap = min(market_caps), max(market_caps)
            update_portfolio_ranges(portfolio_id, min_beta, max_beta, min_market_cap, max_market_cap)
            print(f"Portfolio Beta Range: {min_beta:.2f} – {max_beta:.2f}")
            print(f"Portfolio Market Cap Range: {min_market_cap:.2f} – {max_market_cap:.2f} USD")
        else:
            print("No valid beta or market cap data for this portfolio.")
            continue

        # 2.5 Calculate min max range based on wavg

        beta_range_min, beta_range_max, marketcap_range_min, marketcap_range_max = get_reference_ranges(min_beta, max_beta, min_market_cap, max_market_cap, num_shares, tickers)
        print(f"[DEBUG] main: beta_range_min={beta_range_min}, beta_range_max={beta_range_max}, marketcap_range_min={marketcap_range_min}, marketcap_range_max={marketcap_range_max}")

        # 3. Find and store recommendations
        print("Finding and storing recommendations...")
        clear_recommendations(portfolio_id)
        matches = find_stocks_in_range(
            beta_range_min, beta_range_max,
            marketcap_range_min, marketcap_range_max,
            #tickers,
            max_results=10
        )
        print(f"[DEBUG] main: matches={matches}")
        enriched = get_eps_and_pe_finnhub(matches, api_key=API_KEY)
        print(f"[DEBUG] main: enriched={enriched}")
        # Deduplicate by stock symbol
        seen = set()
        unique_enriched = []
        for stock in enriched:
            if stock['symbol'] not in seen:
                unique_enriched.append(stock)
                seen.add(stock['symbol'])
        print(f"[DEBUG] main: unique_enriched={unique_enriched}")
        for stock in unique_enriched:
            print(f"About to fetch company name for {stock['symbol']}")
            company_name = get_company_name(stock['symbol'])
            print(f"Fetched company name for {stock['symbol']}: {company_name}")
            # time.sleep(0.05) time.sleep not required here 
            insert_recommendation(portfolio_id, stock['symbol'], stock['beta'], stock['market_cap'], stock['eps'], stock['pe_ratio'], company_name)
            print(f"Recommended: {stock['symbol']} EPS={stock['eps']} P/E={stock['pe_ratio']} Name={company_name}")
        print("Top 5 Stock Suggestions (based on EPS / P/E ratio):")
        top_5 = suggest_top_stocks(unique_enriched)
        for stock in top_5:
            print(f"{stock['symbol']}: EPS={stock['eps']}, P/E={stock['pe_ratio']}, Score={round(stock['eps']/stock['pe_ratio'], 2)}")

if __name__ == "_main_":
    main()