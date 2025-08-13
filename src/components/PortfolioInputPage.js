import React, { useState, useRef } from "react";
import "../styles/portfolioInput.css";
import apiService from "../services/api";
import Button from "./Button";

const PortfolioInputPage = ({ onContinue, onGoHome, onProceed }) => {
  const [portfolios, setPortfolios] = useState([
    {
      id: 1,
      name: "",
      stocks: [{ ticker: "", name: "", shares: "" }]
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const submitBtnRef = useRef();
  const [showExcelMsg, setShowExcelMsg] = useState(false);
  const proceedBtnRef = useRef();

  const addPortfolio = () => {
    const newId = portfolios.length + 1;
    setPortfolios([
      ...portfolios,
      {
        id: newId,
        name: "",
        stocks: [{ ticker: "", name: "", shares: "" }]
      }
    ]);
  };

  const removePortfolio = (portfolioIndex) => {
    if (portfolios.length > 1) {
      const updatedPortfolios = portfolios.filter((_, index) => index !== portfolioIndex);
      // Reassign IDs
      const reorderedPortfolios = updatedPortfolios.map((portfolio, index) => ({
        ...portfolio,
        id: index + 1
      }));
      setPortfolios(reorderedPortfolios);
    }
  };

  const updatePortfolioName = (portfolioIndex, name) => {
    const updatedPortfolios = [...portfolios];
    updatedPortfolios[portfolioIndex].name = name;
    setPortfolios(updatedPortfolios);
  };

  const addStock = (portfolioIndex) => {
    const updatedPortfolios = [...portfolios];
    updatedPortfolios[portfolioIndex].stocks.push({ ticker: "", name: "", shares: "" });
    setPortfolios(updatedPortfolios);
  };

  const removeStock = (portfolioIndex, stockIndex) => {
    const updatedPortfolios = [...portfolios];
    if (updatedPortfolios[portfolioIndex].stocks.length > 1) {
      updatedPortfolios[portfolioIndex].stocks.splice(stockIndex, 1);
      setPortfolios(updatedPortfolios);
    }
  };

  const updateStock = (portfolioIndex, stockIndex, field, value) => {
    const updatedPortfolios = [...portfolios];
    updatedPortfolios[portfolioIndex].stocks[stockIndex][field] = value;
    setPortfolios(updatedPortfolios);
  };

  const handleContinue = async () => {
    // Filter out empty portfolios and stocks
    const validPortfolios = portfolios
      .filter(portfolio => portfolio.name.trim() !== "")
      .map(portfolio => ({
        ...portfolio,
        stocks: portfolio.stocks.filter(stock => stock.ticker.trim() !== "" && stock.name.trim() !== "" && stock.shares && !isNaN(Number(stock.shares)) && Number(stock.shares) > 0)
      }))
      .filter(portfolio => portfolio.stocks.length > 0);

    if (validPortfolios.length === 0) {
      setError("Please add at least one portfolio with valid stocks and number of shares.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Save portfolios to backend
      const saveResponse = await apiService.savePortfolios(validPortfolios);
      
      if (saveResponse.success) {
        console.log("Portfolios saved successfully:", saveResponse.message);
        // Continue to analysis page
      onContinue(validPortfolios);
      } else {
        setError("Failed to save portfolios. Please try again.");
      }
    } catch (error) {
      console.error("Error saving portfolios:", error);
      setError("Error connecting to server. Please check if the backend is running.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitBtnClick = (e) => {
    // Ripple effect
    const btn = submitBtnRef.current;
    if (!btn) return;
    const ripple = document.createElement("span");
    ripple.className = "submit-btn-ripple";
    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    handleContinue();
  };

  const handleProceedBtnClick = (e) => {
    // Ripple effect
    const btn = proceedBtnRef.current;
    if (!btn) return;
    const ripple = document.createElement("span");
    ripple.className = "proceed-btn-ripple";
    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    if (onProceed) onProceed();
  };

  const isValidForm = () => {
    return portfolios.some(portfolio => 
      portfolio.name.trim() !== "" && 
      portfolio.stocks.some(stock => stock.ticker.trim() !== "" && stock.name.trim() !== "" && stock.shares && !isNaN(Number(stock.shares)) && Number(stock.shares) > 0)
    );
  };

  return (
    <div className="portfolio-input-container">
      <Button
        onClick={onGoHome}
        variant="secondary"
        size="medium"
        className="go-home-btn-top-left"
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: 'rgba(255,255,255,0.97)',
          color: '#667eea',
          fontWeight: 700,
          borderRadius: 30,
          padding: '10px 28px',
          fontSize: '1.08rem',
          boxShadow: '0 4px 18px #667eea22',
          border: '1.5px solid #e2e8f0',
          zIndex: 20,
          cursor: 'pointer',
          transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
        }}
      >
        🏠 Go to Home
      </Button>
      <div style={{ textAlign: 'right', marginBottom: 18, marginTop: 8 }}>
        <Button
          className="import-excel-btn"
          variant="primary"
          size="medium"
          style={{
            background: 'linear-gradient(90deg, #2DCE89 0%, #667eea 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 24,
            padding: '10px 28px',
            fontSize: '1.05rem',
            boxShadow: '0 4px 18px #2DCE8922',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
          }}
          onClick={() => {
            setShowExcelMsg(true);
            setTimeout(() => setShowExcelMsg(false), 2200);
          }}
        >
          📥 Import from Excel
        </Button>
      </div>
      {showExcelMsg && (
        <div style={{
          background: 'linear-gradient(90deg, #2DCE89 0%, #667eea 100%)',
          border: '2.5px solid #2DCE89',
          borderRadius: '16px',
          padding: '22px 18px',
          margin: '0 auto 28px auto',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '1.25rem',
          boxShadow: '0 0 24px #2DCE89cc, 0 2px 18px #667eea55',
          maxWidth: 420,
          letterSpacing: '0.01em',
          zIndex: 20,
          animation: 'excelMsgPop 0.5s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14
        }}>
          <span style={{fontSize: '2rem', filter: 'drop-shadow(0 2px 8px #fff8)'}}>📥</span>
          Excel import feature coming soon!
        </div>
      )}
      <div className="input-header">
        <h2>📝 Portfolio Configuration</h2>
        <p>
          Enter your portfolio details and stock information. 
          You can add multiple portfolios and stocks for comprehensive analysis.
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
        </div>
      )}

      <div className="portfolios-section">
        {portfolios.map((portfolio, portfolioIndex) => (
          <div key={portfolioIndex} className={`portfolio-input-card${portfolios.length === 1 ? ' single-portfolio' : ''}`}>
            <div className="portfolio-header">
              <h3>Portfolio #{portfolio.id}</h3>
              {portfolios.length > 1 && (
                <Button
                  onClick={() => removePortfolio(portfolioIndex)}
                  className="remove-btn"
                  variant="outline"
                  size="small"
                  title="Remove Portfolio"
                >
                  🗑️
                </Button>
              )}
            </div>

            <div className="input-group">
              <label>Portfolio Name:</label>
              <input
                type="text"
                value={portfolio.name}
                onChange={(e) => updatePortfolioName(portfolioIndex, e.target.value)}
                placeholder="e.g., Tech Titans, Growth Portfolio"
                className="portfolio-name-input"
              />
            </div>

            <div className="stocks-section" style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 6, border: '1px solid #e2e8f0', borderRadius: 8, background: 'rgba(247,250,252,0.7)', marginBottom: 0 }}>
              <div className="stocks-header">
                <h4>Stocks:</h4>
              </div>
              <div className="stocks-table-header" style={{ display: 'flex', fontWeight: 500, color: '#2d3748', background: 'rgba(230,236,245,0.7)', borderRadius: 6, padding: '4px 8px', marginBottom: 6, fontSize: '0.92rem', borderBottom: '1px solid #e2e8f0', alignItems: 'center', gap: 70 }}>
                <div style={{ flex: 1, textAlign: 'left' }}>Stock Ticker</div>
                <div style={{ flex: 2, textAlign: 'left',paddingLeft:20 }}>Stock Name</div>
                <div style={{ flex: 1, textAlign: 'left', paddingLeft:70 }}>No. of Shares</div>
                <div style={{ width: 36 }}></div>
              </div>
              {portfolio.stocks.map((stock, stockIndex) => (
                <div key={stockIndex} className="stock-input-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '8px 0', background: 'none', border: 'none' }}>
                  <input
                    type="text"
                    value={stock.ticker}
                    onChange={(e) => updateStock(portfolioIndex, stockIndex, 'ticker', e.target.value)}
                    placeholder="e.g., AAPL"
                    className="stock-ticker-input"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    value={stock.name}
                    onChange={(e) => updateStock(portfolioIndex, stockIndex, 'name', e.target.value)}
                    placeholder="e.g., Apple Inc."
                    className="stock-name-input"
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    min="1"
                    value={stock.shares}
                    onChange={(e) => updateStock(portfolioIndex, stockIndex, 'shares', e.target.value)}
                    placeholder="e.g., 10"
                    className="stock-name-input"
                    style={{ flex: 1 }}
                  />
                  {portfolio.stocks.length > 1 && (
                    <button
                      onClick={() => removeStock(portfolioIndex, stockIndex)}
                      className="remove-stock-btn"
                      title="Remove Stock"
                      style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
                    >
                      ✖️
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', margin: '10px 0 18px 0' }}>
              <Button
                onClick={() => addStock(portfolioIndex)}
                className="add-stock-btn"
                variant="outline"
                size="small"
              >
                ➕ Add Stock
              </Button>
            </div>
          </div>
        ))}

        <Button onClick={addPortfolio} className="add-portfolio-btn" variant="outline" size="medium">
          ➕ Add Another Portfolio
        </Button>
      </div>

      <div className="action-buttons">
        <Button
          onClick={handleContinue}
          disabled={!isValidForm() || isSaving}
          className="continue-btn"
          variant="primary"
          size="large"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {isSaving ? "🔄 Saving..." : " Submit Portfolio"}
        </Button>
        <Button
          ref={proceedBtnRef}
          onClick={handleProceedBtnClick}
          className="continue-btn proceed-btn attractive-proceed-btn"
          variant="secondary"
          size="large"
          style={{ marginLeft: 16, background: '#fff', color: '#667eea', fontWeight: 700, border: '2.5px solid transparent', backgroundImage: 'linear-gradient(90deg, #fff, #fff), linear-gradient(90deg, #2DCE89 0%, #667eea 100%)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 18px #2DCE8922, 0 2px 8px #667eea22', transition: 'box-shadow 0.18s, border-color 0.18s', position: 'relative', overflow: 'hidden' }}
        >
          Already submitted? Proceed
        </Button>
      </div>
      <style>{`
.attractive-submit-btn {
  border: 2.5px solid transparent;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%), linear-gradient(90deg, #2DCE89 0%, #667eea 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow: 0 0 18px #2DCE8922, 0 6px 20px #667eea44;
  position: relative;
  transition: box-shadow 0.18s, border-color 0.18s;
}
.attractive-submit-btn:focus, .attractive-submit-btn:hover {
  box-shadow: 0 0 32px #2DCE89cc, 0 10px 30px #667eea66;
  border-color: #2DCE89;
}
.submit-btn-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
  width: 120px;
  height: 120px;
  left: 50%;
  top: 50%;
  margin-left: -60px;
  margin-top: -60px;
  z-index: 2;
}
@keyframes ripple {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
@keyframes excelMsgPop {
  0% { opacity: 0; transform: scale(0.85) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.proceed-btn:hover, .proceed-btn:focus {
  background: #f7fafc;
  color: #2DCE89;
  border-color: #2DCE89;
  box-shadow: 0 8px 24px #2DCE8922;
  transform: translateY(-2px) scale(1.04);
}
.attractive-proceed-btn:hover, .attractive-proceed-btn:focus {
  box-shadow: 0 0 32px #2DCE89cc, 0 8px 24px #667eea44;
  border-color: #2DCE89;
  color: #2DCE89;
  background: #f7fafc;
}
.proceed-btn-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(45,206,137,0.18);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
  width: 120px;
  height: 120px;
  left: 50%;
  top: 50%;
  margin-left: -60px;
  margin-top: -60px;
  z-index: 2;
}
@keyframes ripple {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
`}</style>
    </div>
  );
};

export default PortfolioInputPage; 