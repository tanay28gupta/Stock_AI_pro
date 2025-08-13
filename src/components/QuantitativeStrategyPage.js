import React from "react";
import "../styles/global.css";
import "../styles/analysisPage.css";
import apiService from "../services/api";
import Button from "./Button";
import { badges, floatingIcons, getPortfolioIcon } from "./utils";
import { useState } from "react";
import LoadingAnimation from "./LoadingAnimation";

const BellIcon = ({ onClick, active }) => (
  <span
    onClick={onClick}
    title="Set Price Alert"
    style={{
      cursor: 'pointer',
      fontSize: 20,
      marginRight: 8,
      color: active ? '#2DCE89' : '#a0aec0',
      transition: 'color 0.2s',
      verticalAlign: 'middle',
      display: 'inline-block',
      filter: active ? 'drop-shadow(0 0 6px #2DCE89aa)' : 'none',
    }}
    role="img"
    aria-label="Set Price Alert"
  >
    {active ? '🔔' : '🔕'}
  </span>
);

const QuantitativeStrategyPage = ({ onBack, userPortfolios, autoStart, recommendations = [], loading = false, error = "", onRefresh }) => {
  // Group recommendations by portfolio_id
  const grouped = recommendations.reduce((acc, rec) => {
    if (!acc[rec.portfolio_id]) acc[rec.portfolio_id] = [];
    acc[rec.portfolio_id].push(rec);
    return acc;
  }, {});

  // Add local loading state for refresh
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStock, setModalStock] = useState(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [notifiedStocks, setNotifiedStocks] = useState({});
  const [showAlert, setShowAlert] = useState(false);

  // Extract all tickers from userPortfolios for quick lookup
  const userPortfolioTickers = new Set(
    (userPortfolios || []).flatMap(portfolio =>
      (portfolio.stocks || []).map(stock => stock.ticker?.toUpperCase())
    )
  );

  const openModal = (stock) => {
    setModalStock(stock);
    setTargetPrice("");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalStock(null);
    setTargetPrice("");
  };
  const handleNotify = () => {
    setNotifiedStocks(prev => ({ ...prev, [modalStock.stock_ticker]: true }));
    setModalOpen(false);
    setTimeout(() => {
      window.alert(`🔔 Notification turned on for ${modalStock.stock_ticker} at target price $${targetPrice}!\n\nWe'll notify you when the price is reached.\n\nStay tuned for smart alerts! 🚀`);
    }, 200);
  };

  const handleBuyClick = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const handleRefresh = async () => {
    if (!onRefresh) {
      alert('Refresh handler not provided!');
      return;
    }
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="analysis-container recommendations-bg">
      {/* Animated floating icons in empty spaces */}
      {floatingIcons.map((item, idx) => (
        <span
          key={idx}
          className="floating-stock-icon"
          style={{
            position: 'fixed',
            zIndex: 1,
            pointerEvents: 'none',
            opacity: 0.18,
            ...item.style,
          }}
        >
          {item.icon}
        </span>
      ))}
      {/* Animated glowing lines background */}
      <svg className="glow-lines-bg" width="100%" height="100%" style={{ position: 'fixed', left: 0, top: 0, zIndex: 0, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="glow1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2DCE89" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#764ba2" stopOpacity="0.13" />
          </linearGradient>
          <linearGradient id="glow2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#2DCE89" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <line x1="8%" y1="10%" x2="92%" y2="90%" stroke="url(#glow1)" strokeWidth="6" filter="url(#glow)" />
        <line x1="15%" y1="80%" x2="85%" y2="20%" stroke="url(#glow2)" strokeWidth="5" filter="url(#glow)" />
        <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="url(#glow1)" strokeWidth="3" filter="url(#glow)" />
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>
      {/* Subtle animated gradient overlay */}
      <div className="animated-gradient-overlay" />
      <div className="analysis-header">
        <Button 
          onClick={onBack}
          disabled={loading || refreshing}
          variant="secondary"
          size="medium"
          style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            borderRadius: '50px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#667eea',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            opacity: loading || refreshing ? 0.6 : 1
          }}
        >
          ← Back to Portfolio Input
        </Button>
        <Button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          variant="primary"
          size="medium"
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 28px',
            fontSize: '1rem',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(102,126,234,0.13)',
            cursor: loading || refreshing ? 'not-allowed' : 'pointer',
            opacity: loading || refreshing ? 0.6 : 1,
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          {refreshing || loading ? (
            <span style={{marginRight: 8, display: 'inline-block', width: 18, height: 18, border: '3px solid #e2e8f0', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />
          ) : (
            <span style={{marginRight: 8}}>🔄 Refresh Analysis</span>
          )}
        </Button>
        <h2>📈 Recommended Stocks</h2>
        <p>
          Personalized, data-driven stock suggestions for your portfolio. Our AI analyzes your holdings and market trends to recommend stocks that can help you diversify, grow, and optimize your investments.
        </p>
      </div>
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          zIndex: 1001,
          fontSize: '1rem',
          fontWeight: '600',
          animation: 'fadeInOut 3s forwards'
        }}>
          This feature will be added soon!
        </div>
      )}
      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>{error}</div>
      )}
      {loading ? (
        <LoadingAnimation />
      ) : error ? (
        <div style={{color: 'red', textAlign: 'center', marginTop: 40}}>{error}</div>
      ) : (
        recommendations.length === 0 ? (
          <div style={{textAlign: 'center', marginTop: 40}}>No recommendations found for your portfolios.</div>
        ) : (
          <>
            {/* Explanatory message for green-highlighted rows */}
            <div style={{
              background: '#b6f5b6',
              color: '#225522',
              fontWeight: 600,
              borderRadius: 10,
              padding: '12px 18px',
              margin: '18px auto 0 auto',
              maxWidth: 700,
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(34,85,34,0.08)',
              border: '1.5px solid #8eea8e',
            }}>
              <span style={{fontSize: 18, marginRight: 8}}>✔️</span>
              <span>Rows highlighted in green indicate stocks you already own in your portfolio.</span>
            </div>
            <div className="portfolio-grid">
              {Object.entries(grouped).map(([portfolioId, recs], idx) => {
                // Sort recommendations by EPS/PE descending, parsing values as numbers
                const sortedRecs = [...recs].sort((a, b) => {
                  const aEps = Number(a.eps);
                  const aPe = Number(a.pe_ratio);
                  const bEps = Number(b.eps);
                  const bPe = Number(b.pe_ratio);
                  const aRatio = (isFinite(aEps) && isFinite(aPe) && aPe !== 0) ? aEps / aPe : -Infinity;
                  const bRatio = (isFinite(bEps) && isFinite(bPe) && bPe !== 0) ? bEps / bPe : -Infinity;
                  return bRatio - aRatio;
                });
                return (
                  <div key={portfolioId} className="portfolio-block">
                    <h3>
                      <span className="portfolio-icon">{getPortfolioIcon(recs[0]?.portfolio_name)}</span>
                      {recs[0]?.portfolio_name || `Portfolio ${idx + 1}`}
                    </h3>
                    {/* Add a table for recommendations */}
                    <table className="recommendations-table" style={{
                      width: '100%',
                      marginBottom: 18,
                      borderCollapse: 'separate',
                      borderSpacing: 0,
                      fontSize: 15,
                      borderRadius: 14,
                      overflow: 'hidden',
                      boxShadow: '0 4px 18px rgba(102,126,234,0.10)',
                      background: 'white',
                      marginTop: 10
                    }}>
                      <thead>
                        <tr style={{
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: 15,
                          letterSpacing: 0.2,
                          borderTopLeftRadius: 14,
                          borderTopRightRadius: 14
                        }}>
                          <th style={{padding: '10px 8px', textAlign: 'left'}}>Ticker</th>
                          <th style={{padding: '10px 8px', textAlign: 'left'}}>Company Name</th>
                          <th style={{padding: '10px 8px', textAlign: 'left'}}>Beta</th>
                          <th style={{padding: '10px 8px', textAlign: 'left'}}>Market Cap</th>
                          <th style={{padding: '10px 8px', textAlign: 'left'}}>EPS</th>
                          <th style={{padding: '10px 8px', textAlign: 'left'}}>P/E</th>
                          <th style={{padding: '10px 8px', textAlign: 'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRecs.map((rec, recIdx) => {
                          const isInPortfolio = userPortfolioTickers.has(rec.stock_ticker?.toUpperCase());
                          return (
                            <tr key={rec.stock_ticker + recIdx}
                              style={{
                                background: isInPortfolio
                                  ? '#b6f5b6'
                                  : (recIdx % 2 === 0 ? '#f7f9fc' : '#fff'),
                                borderBottom: '1.5px solid #e2e8f0',
                                transition: 'background 0.2s',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = isInPortfolio ? '#8eea8e' : '#e6e8fa'}
                              onMouseLeave={e => e.currentTarget.style.background = isInPortfolio ? '#b6f5b6' : (recIdx % 2 === 0 ? '#f7f9fc' : '#fff')}
                            >
                              <td style={{padding: '10px 8px', color: '#667eea', fontWeight: 600, borderTopLeftRadius: recIdx === 0 ? 12 : 0}}>
                                <BellIcon onClick={e => { e.stopPropagation(); openModal(rec); }} active={!!notifiedStocks[rec.stock_ticker]} />
                                {rec.stock_ticker}
                              </td>
                              <td style={{padding: '10px 8px'}}>{rec.company_name || '-'}</td>
                              <td style={{padding: '10px 8px'}}>{rec.beta}</td>
                              <td style={{padding: '10px 8px'}}>{
                                typeof rec.market_cap === 'number' && !isNaN(rec.market_cap)
                                  ? (rec.market_cap >= 1_000_000
                                      ? (rec.market_cap / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + 'M'
                                      : rec.market_cap.toLocaleString())
                                  : '-'
                              }</td>
                              <td style={{padding: '10px 8px'}}>{rec.eps}</td>
                              <td style={{padding: '10px 8px', borderTopRightRadius: recIdx === 0 ? 12 : 0}}>{rec.pe_ratio}</td>
                              <td style={{padding: '10px 8px', textAlign: 'center'}}>
                                <Button
                                  onClick={handleBuyClick}
                                  variant="buy"
                                  size="small"
                                >
                                  Buy
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </>
        )
      )}
      {modalOpen && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.28)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.2s',
  }}
    onClick={closeModal}
  >
    <div style={{
      background: 'white',
      borderRadius: 18,
      boxShadow: '0 8px 32px #667eea33',
      padding: '36px 32px',
      minWidth: 320,
      maxWidth: 380,
      width: '90%',
      position: 'relative',
      animation: 'popIn 0.25s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
      onClick={e => e.stopPropagation()}
    >
      <span style={{ fontSize: 32, color: '#2DCE89', marginBottom: 10 }}>🔔</span>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#222' }}>
        Set Price Alert for <span style={{ color: '#667eea' }}>{modalStock?.stock_ticker}</span>
      </div>
      <div style={{ color: '#4a5568', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>
        Enter your target price. We'll notify you when this stock hits your target!
      </div>
      <input
        type="number"
        min="0"
        step="0.01"
        value={targetPrice}
        onChange={e => setTargetPrice(e.target.value)}
        placeholder="e.g. 150.00"
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 16,
          borderRadius: 8,
          border: '1.5px solid #e2e8f0',
          marginBottom: 18,
          outline: 'none',
          boxShadow: '0 1px 4px #667eea11',
        }}
      />
      <Button
        onClick={handleNotify}
        disabled={!targetPrice || isNaN(Number(targetPrice)) || Number(targetPrice) <= 0}
        variant="primary"
        size="large"
        style={{
          width: '100%',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 16,
          background: 'linear-gradient(90deg, #2DCE89 0%, #667eea 100%)',
          color: '#fff',
          boxShadow: '0 2px 8px #2DCE8922',
          marginBottom: 8,
        }}
      >
        Notify Me
      </Button>
      <Button
        onClick={closeModal}
        variant="outline"
        size="medium"
        style={{ width: '100%', borderRadius: 8, fontWeight: 600, fontSize: 15, marginTop: 2 }}
      >
        Cancel
      </Button>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -20px); }
        }
        @keyframes pulseGlowGreen {
              0% { filter: drop-shadow(0 0 0px #2DCE89cc); }
              100% { filter: drop-shadow(0 0 24px #2DCE89cc); }
        }
        @keyframes conveyorMove {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  </div>
)}
    </div>
  );
};

export default QuantitativeStrategyPage; 