import React, { useState, useEffect } from "react";
import "../styles/analysisPage.css";
import apiService from "../services/api";
import { ReactComponent as Logo } from "../logo.svg";
import Button from "./Button";
import Brain from "./Brain";
import TickerTape from "./TickerTape";
import { getPortfolioIcon } from "./utils";
import SentimentLoadingAnimation from "./SentimentLoadingAnimation";

const getSentimentClass = (score) => {
  if (score > 0.2) return "sentiment-positive";
  if (score < -0.2) return "sentiment-negative";
  return "sentiment-neutral";
};

const getSentimentLabel = (score) => {
  if (score > 0.2) return "Positive";
  if (score < -0.2) return "Negative";
  return "Neutral";
};

const AnalysisPage = ({ onBack, userPortfolios }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [openStockDropdowns, setOpenStockDropdowns] = useState({});
  const [newsData, setNewsData] = useState({});
  const [loadingNews, setLoadingNews] = useState({});
  const [newsError, setNewsError] = useState({});

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    setLoading(true);
    setError("");

    try {
      // First try to get existing analysis data
      const response = await apiService.getPortfolios();
      
      // Check if we have portfolios with actual sentiment scores (not 0.0)
      if (response.success && response.data.length > 0) {
        const hasSentimentData = response.data.some(portfolio => 
          portfolio.avg_score !== 0.0 && portfolio.avg_score !== null
        );
        
        if (hasSentimentData) {
          console.log("✅ Found existing sentiment data, using cached results");
          setData(response.data);
          setLoading(false);
          return;
        } else {
          console.log("📊 Found portfolios but no sentiment data, triggering analysis");
        }
      } else {
        console.log("📭 No portfolios found, triggering analysis");
      }

      // If no existing sentiment data, trigger new analysis
      await triggerAnalysis();
    } catch (error) {
      console.error("Error loading analysis data:", error);
      setError("Failed to load analysis data. Please try again.");
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    setIsAnalyzing(true);
    setError("");

    try {
      console.log("🔍 Starting sentiment analysis...");
      const response = await apiService.analyzePortfolios();
      
      if (response.success) {
        console.log("✅ Analysis completed successfully");
        console.log("📊 Analysis results:", response.data);
        setData(response.data);
      } else {
        console.error("❌ Analysis failed:", response.error);
        setError("Analysis failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error during analysis:", error);
      setError("Error during analysis. Please check if the backend is running.");
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalPortfolios = data.length;
    const positivePortfolios = data.filter(p => p.avg_score > 0.2).length;
    const negativePortfolios = data.filter(p => p.avg_score < -0.2).length;
    const neutralPortfolios = totalPortfolios - positivePortfolios - negativePortfolios;
    const avgSentiment = data.reduce((sum, p) => sum + p.avg_score, 0) / totalPortfolios;
    
    return {
      totalPortfolios,
      avgSentiment: avgSentiment.toFixed(2),
      positivePortfolios,
      negativePortfolios,
      neutralPortfolios
    };
  };

  // Helper: Only one dropdown open at a time
  const handleToggleNewsDropdown = async (ticker) => {
    setOpenStockDropdowns((prev) => {
      const newState = {};
      Object.keys(prev).forEach(key => newState[key] = false);
      newState[ticker] = !prev[ticker];
      return newState;
    });
    
    // Only fetch if opening and not already fetched
    if (!openStockDropdowns[ticker] && !newsData[ticker]) {
      setLoadingNews((prev) => ({ ...prev, [ticker]: true }));
      setNewsError((prev) => ({ ...prev, [ticker]: null }));
      try {
        const response = await apiService.getNewsForStock(ticker);
        if (response.success) {
          setNewsData((prev) => ({ ...prev, [ticker]: response.articles }));
        } else {
          setNewsError((prev) => ({ ...prev, [ticker]: response.error || 'Failed to fetch news.' }));
        }
      } catch (e) {
        setNewsError((prev) => ({ ...prev, [ticker]: 'Failed to fetch news.' }));
      } finally {
        setLoadingNews((prev) => ({ ...prev, [ticker]: false }));
      }
    }
  };

  // Helper to check if any stock dropdown is open in a portfolio
  const isAnyDropdownOpen = (portfolio, openStockDropdowns) => {
    return (portfolio.stocks || []).some(stock => openStockDropdowns[stock.ticker]);
  };

  if (loading || isAnalyzing) {
    return <SentimentLoadingAnimation />;
  }

  const stats = calculateStats();

  // Calculate stock-level sentiment counts
  let totalStocks = 0, positiveStocks = 0, negativeStocks = 0, neutralStocks = 0;
  data.forEach(portfolio => {
    (portfolio.stocks || []).forEach(stock => {
      totalStocks++;
      if (stock.sentiment > 0.2) positiveStocks++;
      else if (stock.sentiment < -0.2) negativeStocks++;
      else neutralStocks++;
    });
  });

  // Helper for vertical bar
  const VerticalBar = ({ value, max, color, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 12px' }}>
      <div style={{
        width: 28,
        height: 80,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f8fafc 60%, #e2e8f0 100%)',
        borderRadius: 10,
        position: 'relative',
        marginBottom: 6,
        boxShadow: '0 2px 8px rgba(102,126,234,0.08)',
        border: '1.5px solid #e2e8f0',
      }}>
        <div style={{
          width: 20,
          height: `${max ? Math.max(10, (value / max) * 68) : 10}px`,
          background: `linear-gradient(180deg, ${color} 70%, #fff 100%)`,
          borderRadius: 7,
          transition: 'height 0.5s',
          position: 'absolute',
          bottom: 6,
          left: 4,
          boxShadow: `0 2px 8px ${color}33`,
          border: `1.5px solid ${color}`
        }}></div>
        <span style={{
          position: 'absolute',
          top: 4,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 15,
          color: '#222',
          fontWeight: 1000,
          textShadow: '0 1px 4px #fff, 0 0 2px #fff',
          WebkitTextStroke: '0.5px #fff',
          letterSpacing: 0.5,
          zIndex: 2
        }}>{value}</span>
      </div>
      <span style={{ fontSize: 13, color: '#2d3748', marginTop: 2, fontWeight: 500 }}>{label}</span>
    </div>
  );

  // Change neutral color from gray to orange used for neutral sentiment
  const NEUTRAL_COLOR = '#f6ad55'; // Orange shade used for neutral sentiment elsewhere

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <Button 
          onClick={onBack}
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
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          ← Back to Portfolio Input
        </Button>
        
        <Button 
          onClick={triggerAnalysis}
          disabled={isAnalyzing}
          variant="primary"
          size="medium"
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            borderRadius: '50px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            opacity: isAnalyzing ? 0.6 : 1
          }}
        >
          {isAnalyzing ? "🔄 Analyzing..." : "🔍 Analyze Portfolios"}
        </Button>
        
        <h2>📊 Portfolio Sentiment Analysis</h2>
        <p>
          AI-powered sentiment analysis of your investment portfolios. 
          Monitor market sentiment and make data-driven decisions.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(245, 101, 101, 0.1)',
          border: '1px solid rgba(245, 101, 101, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#e53e3e',
          textAlign: 'center'
        }}>
          {error}
          <Button 
            onClick={triggerAnalysis}
            disabled={isAnalyzing}
            variant="outline"
            size="small"
            style={{
              marginLeft: '10px',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#667eea',
              fontSize: '0.85rem'
            }}
          >
            {isAnalyzing ? "🔄 Analyzing..." : "🔄 Retry Analysis"}
          </Button>
        </div>
      )}

      {/* Summary Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a202c' }}>{stats.totalPortfolios}</div>
          <div style={{ color: '#4a5568', fontSize: '0.9rem' }}>Total Portfolios</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a202c' }}>{stats.avgSentiment}</div>
          <div style={{ color: '#4a5568', fontSize: '0.9rem' }}>Avg Sentiment</div>
        </div>
        {/* Side-by-side vertical bar graphs for Portfolio and Stock Sentiment Distribution */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.97)',
          padding: '20px 10px',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(102,126,234,0.10)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'flex-end',
          minHeight: 170,
          gridColumn: 'span 2',
        }}>
          {/* Portfolio Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 24 }}>
            <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 15, marginBottom: 8 }}>Portfolio Sentiment</div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', height: 100 }}>
              <VerticalBar value={stats.positivePortfolios} max={stats.totalPortfolios} color="#38a169" label="Positive" />
              <VerticalBar value={stats.negativePortfolios} max={stats.totalPortfolios} color="#e53e3e" label="Negative" />
              <VerticalBar value={stats.neutralPortfolios} max={stats.totalPortfolios} color={NEUTRAL_COLOR} label="Neutral" />
            </div>
          </div>
          {/* Stock Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 24 }}>
            <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 15, marginBottom: 8 }}>Stock Sentiment</div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', height: 100 }}>
              <VerticalBar value={positiveStocks} max={totalStocks} color="#38a169" label="Positive" />
              <VerticalBar value={negativeStocks} max={totalStocks} color="#e53e3e" label="Negative" />
              <VerticalBar value={neutralStocks} max={totalStocks} color={NEUTRAL_COLOR} label="Neutral" />
            </div>
        </div>
        </div>
      </div>

      <div className="portfolio-grid">
        {data.map((portfolio) => {
          const expanded = isAnyDropdownOpen(portfolio, openStockDropdowns);
          return (
            <div
              key={portfolio.portfolio_id}
              className="portfolio-block"
              style={{
                background: expanded ? 'linear-gradient(90deg, #f8fafc 80%, #e9e7fa 100%)' : 'rgba(255,255,255,0.97)',
                boxShadow: expanded ? '0 8px 32px rgba(102,126,234,0.18)' : '0 8px 32px rgba(102,126,234,0.13)',
                border: expanded ? '2.5px solid #a3bffa' : '1.5px solid #e2e8f0',
                position: 'relative',
                padding: expanded ? '38px 38px 32px 18px' : '32px 28px',
                transition: 'all 0.35s cubic-bezier(.4,2,.6,1)',
                minHeight: expanded ? 420 : 320,
                overflow: 'visible',
                marginBottom: expanded ? 32 : 0,
                display: 'block',
              }}
            >
              {expanded && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 8,
                  borderRadius: '12px 0 0 12px',
                  background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 0 16px #667eea33',
                }} />
              )}
              <h3>
                <span className="portfolio-icon">{getPortfolioIcon(portfolio.portfolio_name)}</span>
                {portfolio.portfolio_name}
              </h3>
              
              <div className="portfolio-score" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                <strong>Portfolio Sentiment:</strong>
                <span style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color:
                    portfolio.avg_score > 0.2
                      ? '#217a36' // green
                      : portfolio.avg_score < -0.2
                      ? '#b91c1c' // red
                      : '#b45309', // orange
                  background:
                    portfolio.avg_score > 0.2
                      ? '#e6fae6'
                      : portfolio.avg_score < -0.2
                      ? '#fde8e8'
                      : '#fff7ed',
                  borderRadius: 8,
                  padding: '4px 16px',
                  boxShadow: '0 2px 8px #2DCE8922',
                  letterSpacing: 0.2,
                  border:
                    portfolio.avg_score > 0.2
                      ? '1.5px solid #38a169'
                      : portfolio.avg_score < -0.2
                      ? '1.5px solid #e53e3e'
                      : '1.5px solid #f6ad55',
                }}>
                  {(
                    Math.round(portfolio.avg_score * 100) / 100
                  ).toFixed(2)}
                </span>
              </div>
              
              <ul className="stocks-list">
                <div className="stocks-header-row" style={{ display: 'flex', alignItems: 'center', padding: '0 0 6px 0', borderBottom: '2px solid #e2e8f0', fontSize: 15, fontWeight: 700, color: '#667eea' }}>
                  <span style={{ flex: 2 }}>Ticker</span>
                  <span style={{ flex: 1 }}>Sentiment</span>
                  <span style={{ width: 32 }}></span>
                </div>
                {portfolio.stocks.map((stock, index) => (
                  <React.Fragment key={index}>
                    <li
                      className="stock-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0,
                        padding: '8px 0',
                        borderBottom: '1px solid #e2e8f0',
                        background: openStockDropdowns[stock.ticker] ? '#f7f9fc' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => handleToggleNewsDropdown(stock.ticker)}
                    >
                      <span style={{ flex: 2, fontWeight: 600, color: '#2d3748' }}>{stock.ticker}</span>
                      <span
                        className={`stock-sentiment ${getSentimentClass(stock.sentiment)}`}
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          padding: '2px 12px',
                          fontWeight: 700,
                          fontSize: 15,
                          background: stock.sentiment > 0.2
                            ? 'linear-gradient(90deg,#38a169,#68d391)'
                            : stock.sentiment < -0.2
                            ? 'linear-gradient(90deg,#e53e3e,#feb2b2)'
                            : 'linear-gradient(90deg,#f6ad55,#fbd38d)',
                          color: '#fff',
                          display: 'inline-block',
                          textAlign: 'center',
                        }}
                      >
                        {(
                          Math.round(stock.sentiment * 100) / 100
                        ).toFixed(2)}
                      </span>
                      <span style={{ width: 32, textAlign: 'center', fontSize: 20, color: '#667eea' }}>
                        {openStockDropdowns[stock.ticker] ? '▼' : '▶'}
                      </span>
                    </li>
                    {openStockDropdowns[stock.ticker] && (
                      <li className="news-dropdown-row" style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        boxShadow: '0 2px 8px #667eea11',
                        margin: '0 0 8px 0',
                        padding: '10px 18px 10px 32px',
                        fontSize: 15,
                        position: 'relative',
                      }}>
                        {loadingNews[stock.ticker] ? (
                          <div style={{ color: '#667eea', fontWeight: 500 }}>Loading news...</div>
                        ) : newsError[stock.ticker] ? (
                          <div style={{ color: 'red' }}>{newsError[stock.ticker]}</div>
                        ) : newsData[stock.ticker] && newsData[stock.ticker].length > 0 ? (
                          <div>
                            {(newsData[stock.ticker].slice(0, newsData[stock.ticker].showAll ? newsData[stock.ticker].length : 3)).map((article, i) => (
                              <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                borderBottom: i < (newsData[stock.ticker].showAll ? newsData[stock.ticker].length : 3) - 1 ? '1px dashed #e2e8f0' : 'none',
                                padding: '6px 0',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}>
                                <span style={{ fontSize: 16, color: '#667eea' }}>📰</span>
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#3182ce',
                                    textDecoration: 'underline',
                                    fontWeight: 600,
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  title={article.title}
                                >
                                  {article.title.length > 60 ? article.title.slice(0, 60) + '…' : article.title}
                                </a>
                                <span style={{
                                  borderRadius: 8,
                                  padding: '2px 8px',
                                  fontWeight: 700,
                                  fontSize: 13,
                                  background: article.sent_score > 0.2
                                    ? '#38a169'
                                    : article.sent_score < -0.2
                                    ? '#e53e3e'
                                    : '#f6ad55',
                                  color: '#fff',
                                }}>
                                  {(
                                    Math.round(article.sent_score * 100) / 100
                                  ).toFixed(2)}
                                </span>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6, color: '#aaa', fontSize: 18 }} title="Open link">🔗</a>
                              </div>
                            ))}
                            {newsData[stock.ticker].length > 3 && !newsData[stock.ticker].showAll && (
                              <div style={{ textAlign: 'right', marginTop: 4 }}>
                                <Button
                                  variant="link"
                                  size="small"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#667eea',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    padding: 0,
                                  }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setNewsData(prev => ({
                                      ...prev,
                                      [stock.ticker]: Object.assign([...prev[stock.ticker]], { showAll: true })
                                    }));
                                  }}
                                >
                                  Show more...
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: '#888' }}>No news articles found for this stock.</div>
                        )}
                      </li>
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisPage;
