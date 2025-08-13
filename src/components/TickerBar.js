import React, { useEffect, useRef, useState } from "react";
import "../styles/tickerBar.css";
import { FINNHUB_API_KEY } from "../config";

// Expanded list of popular US stocks from various sectors
const symbols = [
  "AAPL", "GOOGL", "TSLA", "AMZN", "MSFT", "NFLX", "NVDA", "META", "JPM", "V",
  "BAC", "WMT", "DIS", "MA", "UNH", "HD", "PG", "PFE", "KO", "PEP",
  "CSCO", "INTC", "T", "XOM", "CVX", "MRK", "ABT", "COST", "MCD", "CRM",
  "ADBE", "ORCL", "QCOM", "NKE", "LLY", "TMO", "AVGO", "TXN", "MDT", "AMGN"
];

const defaultStocks = symbols.map((symbol, i) => ({
  symbol,
  price: 100 + i * 10,
  change: i % 2 === 0 ? "+1.23%" : "-0.45%"
}));

const fetchFinnhubQuotes = async (symbols, apiKey) => {
  const requests = symbols.map(symbol =>
    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data || !data.c || !data.pc) return null;
        const price = data.c;
        const prevClose = data.pc;
        const change = price - prevClose;
        const percent = prevClose ? ((change / prevClose) * 100).toFixed(2) : "0.00";
        return {
          symbol,
          price,
          change: `${change >= 0 ? "+" : ""}${percent}%`,
        };
      })
      .catch((err) => { console.error(`Error fetching ${symbol}:`, err); return null; })
  );
  const results = await Promise.all(requests);
  return results.filter(Boolean);
};

const TickerBar = () => {
  const [tickerStocks, setTickerStocks] = useState(defaultStocks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const tickerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function updateStocks() {
      setLoading(true);
      setError("");
      try {
        if (FINNHUB_API_KEY && FINNHUB_API_KEY !== "YOUR_FINNHUB_API_KEY_HERE") {
          const live = await fetchFinnhubQuotes(symbols, FINNHUB_API_KEY);
          if (isMounted && live.length > 0) {
            setTickerStocks(live);
            setError("");
          } else if (isMounted) {
            setError("No live data returned from Finnhub. Check your API key and quota.");
            setTickerStocks(defaultStocks);
          }
        } else {
          setError("No Finnhub API key set.");
          setTickerStocks(defaultStocks);
        }
      } catch (err) {
        setError("Error fetching live stock data. See console for details.");
        setTickerStocks(defaultStocks);
        console.error("TickerBar fetch error:", err);
      }
      setLoading(false);
    }
    updateStocks();
    const interval = setInterval(updateStocks, 120000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="ticker-bar-outer">
      {loading && (
        <div className="ticker-bar-loading">
          <span className="ticker-bar-spinner" /> Loading stock data...
        </div>
      )}
      {error && (
        <div className="ticker-bar-error">{error}</div>
      )}
      <div className="ticker-bar-inner" ref={tickerRef} style={{ opacity: loading ? 0.4 : 1, animationDuration: '44s' }}>
        {Array(2).fill(0).map((_, idx) => (
          <React.Fragment key={idx}>
            {tickerStocks.map((stock, i) => (
              <span className="ticker-bar-item" key={stock.symbol + i + idx}>
                <span className="ticker-bar-symbol">{stock.symbol}</span>
                <span className="ticker-bar-price">{stock.price.toFixed(2)}</span>
                <span className={`ticker-bar-change ${stock.change.startsWith('+') ? 'up' : 'down'}`}>{stock.change}</span>
              </span>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TickerBar; 