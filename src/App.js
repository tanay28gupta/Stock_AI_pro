import React, { useState } from "react";
import TitleBar from "./components/TitleBar";
import LandingPage from "./components/LandingPage";
import PortfolioInputPage from "./components/PortfolioInputPage";
import AnalysisPage from "./components/AnalysisPage";
import QuantitativeStrategyPage from "./components/QuantitativeStrategyPage";
import ChooseAnalysisType from "./components/ChooseAnalysisType";
import TickerBar from "./components/TickerBar";
import "./App.css";
import apiService from "./services/api";

function App() {
  const [page, setPage] = useState("landing");
  const [userPortfolios, setUserPortfolios] = useState([]);
  const [autoStartQRE, setAutoStartQRE] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = 1; // TODO: Replace with actual user ID logic if needed

  const handleStart = () => {
    setPage("input");
  };

  const handlePortfolioSubmit = (portfolios) => {
    setUserPortfolios(portfolios);
    setPage("choose-analysis-type");
  };

  const handleChooseAnalysis = async (type) => {
    if (type === "sentiment") {
      setPage("analysis");
      setAutoStartQRE(false);
    } else if (type === "quantitative") {
      setLoading(true);
      setError("");
      setRecommendations([]);
      setPage("quantitative");
      setAutoStartQRE(true);
      try {
        const res = await apiService.getRecommendations(userId);
        if (res.success) {
          setRecommendations(res.recommendations || []);
        } else {
          setError(res.error || "Failed to get recommendations");
        }
      } catch (err) {
        setError("Network error");
      }
      setLoading(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getRecommendations(userId);
      if (res.success) {
        setRecommendations(res.recommendations || []);
      } else {
        setError(res.error || "Failed to get recommendations");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (page === "analysis" || page === "quantitative") {
      setPage("choose-analysis-type");
    } else if (page === "choose-analysis-type") {
      setPage("input");
    } else if (page === "input") {
      setPage("landing");
    }
  };

  return (
    <div>
      <TitleBar 
        onHome={() => setPage('landing')} 
        onNavigate={pageName => setPage(pageName)} 
      />
      <TickerBar />
      {page === "landing" ? (
        <LandingPage onStart={handleStart} />
      ) : page === "input" ? (
        <PortfolioInputPage onContinue={handlePortfolioSubmit} onGoHome={() => setPage('landing')} onProceed={() => setPage('choose-analysis-type')} />
      ) : page === "choose-analysis-type" ? (
        <ChooseAnalysisType onChoose={handleChooseAnalysis} onBack={handleBack} />
      ) : page === "analysis" ? (
        <AnalysisPage onBack={handleBack} userPortfolios={userPortfolios} />
      ) : (
        <QuantitativeStrategyPage 
          onBack={handleBack} 
          userPortfolios={userPortfolios} 
          autoStart={autoStartQRE} 
          recommendations={recommendations}
          loading={loading}
          error={error}
          onRefresh={handleRefreshRecommendations}
        />
      )}
      {/* Optionally show a global loading/error overlay */}
      {/* {loading && <div>Loading...</div>} */}
      {/* {error && <div style={{color: 'red'}}>{error}</div>} */}
    </div>
  );
}

export default App;
