import React from "react";

const TickerTape = ({ tickers }) => (
  <div className="ticker-tape">
    <div className="ticker-tape-inner">
      {Array(2).fill(0).map((_, idx) => (
        <React.Fragment key={idx}>
          {tickers.map((t, i) => (
            <span className="ticker-item" key={t.symbol + i + idx}>
              <span className="ticker-symbol">{t.symbol}</span>
              <span className="ticker-price">{t.price.toFixed(2)}</span>
              <span className={`ticker-change ${t.change.startsWith('+') ? 'up' : 'down'}`}>{t.change}</span>
            </span>
          ))}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default TickerTape; 