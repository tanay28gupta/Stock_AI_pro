import React from "react";
import "../styles/global.css";
import "../styles/landingPage.css";
import "../styles/animatedButton.css";
import Badge from "./Badge";

const accentIcons = [
  { icon: "🧠", style: { top: 18, left: 18, fontSize: 32, opacity: 0.13 } },
  { icon: "📈", style: { bottom: 18, right: 18, fontSize: 36, opacity: 0.13 } },
  { icon: "🎯", style: { top: 18, right: 28, fontSize: 28, opacity: 0.10 } },
];

const Blobs = () => (
  <>
    {/* Left animated blurred gradient blob */}
    <div style={{
      position: 'absolute',
      left: -120,
      top: '18%',
      width: 320,
      height: 320,
      background: 'radial-gradient(circle at 40% 60%, #667eea 0%, #764ba2 80%)',
      opacity: 0.22,
      filter: 'blur(60px)',
      zIndex: 0,
      pointerEvents: 'none',
      borderRadius: '50%',
      animation: 'blobMove1 12s ease-in-out infinite alternate'
    }} />
    {/* Right animated blurred gradient blob */}
    <div style={{
      position: 'absolute',
      right: -120,
      bottom: '12%',
      width: 320,
      height: 320,
      background: 'radial-gradient(circle at 60% 40%, #2DCE89 0%, #667eea 80%)',
      opacity: 0.18,
      filter: 'blur(60px)',
      zIndex: 0,
      pointerEvents: 'none',
      borderRadius: '50%',
      animation: 'blobMove2 14s ease-in-out infinite alternate'
    }} />
    <style>{`
      @keyframes blobMove1 {
        0% { transform: translateY(0) scale(1); }
        100% { transform: translateY(-30px) scale(1.08); }
      }
      @keyframes blobMove2 {
        0% { transform: translateY(0) scale(1); }
        100% { transform: translateY(30px) scale(1.06); }
      }
    `}</style>
  </>
);

const ChooseAnalysisType = ({ onChoose, onBack }) => {
  return (
    <div
      className="choose-analysis-type-bg"
      style={{
        minHeight: '100vh',
        display: 'block',
        background: 'linear-gradient(120deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px 8px 0 8px',
      }}
    >
      <Blobs />
      <div className="feature-card choice-card-glow" style={{
        maxWidth: 1200,
        width: '100%',
        margin: '15px auto 0 auto',
        padding: 0,
        borderRadius: 22,
        boxShadow: '0 8px 32px rgba(102,126,234,0.18)',
        position: 'relative',
        zIndex: 2,
        background: 'rgba(255,255,255,0.97)',
        border: '1.5px solid rgba(102,126,234,0.13)',
        backdropFilter: 'blur(8px)'
      }}>
        {/* Gradient accent bar */}
        <div style={{height: 8, width: '100%', borderRadius: '22px 22px 0 0', background: 'linear-gradient(90deg, #667eea, #764ba2)', marginBottom: 0}} />
        <div style={{padding: 48}}>
          <h2 style={{ textAlign: 'center', marginBottom: 8, color: '#1a202c', fontWeight: 700, fontSize: '2.3rem', letterSpacing: '-0.01em' }}>Welcome to Stock Insight Pro</h2>
          <p style={{ textAlign: 'center', color: '#764ba2', fontWeight: 600, fontSize: '1.15rem', marginBottom: 18, letterSpacing: '-0.01em' }}>
            Institutional Portfolio Analysis Platform
          </p>
          <p style={{ textAlign: 'center', color: '#4a5568', marginBottom: 38, fontSize: '1.13rem', lineHeight: 1.6 }}>
            Unlock powerful insights for your portfolio. Choose an analysis type below to get started:
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 48,
              marginBottom: 38,
              justifyContent: 'center',
              alignItems: 'stretch',
              flexWrap: 'wrap',
              minHeight: 260,
            }}
          >
            {/* Sentiment Analysis Option */}
            <div style={{
              flex: 1,
              minWidth: 320,
              maxWidth: 520,
              background: 'rgba(255,255,255,0.98)',
              borderRadius: 18,
              boxShadow: '0 2px 12px rgba(102,126,234,0.08)',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              position: 'relative',
              transition: 'box-shadow 0.2s',
            }}>
              <Badge color="linear-gradient(90deg, #667eea, #764ba2)">AI Powered</Badge>
              <span style={{fontSize: 32, animation: 'pulse 1.5s infinite', marginBottom: 10}} role="img" aria-label="Sentiment">🧠</span>
              <div style={{fontWeight: 700, fontSize: 22, color: '#1a202c', marginBottom: 6}}>Sentiment Analysis</div>
              <div style={{fontSize: 15, color: '#4a5568', marginBottom: 18}}>
                Analyze market sentiment for your portfolio stocks using advanced AI and real-time data from multiple sources.
              </div>
              <ul style={{fontSize: 14, color: '#667eea', marginBottom: 18, marginLeft: 18, listStyle: 'disc'}}>
                <li>Real-time news & social media analysis</li>
                <li>Visual sentiment indicators</li>
                <li>Actionable insights for risk & opportunity</li>
              </ul>
              <button
                className="animated-action-button"
                onClick={() => onChoose('sentiment')}
              >
                Explore Sentiment Analysis
              </button>
            </div>
            {/* Divider */}
            <div style={{width: 2, background: 'linear-gradient(180deg, #667eea, #764ba2)', borderRadius: 2, margin: '0 18px', alignSelf: 'stretch', opacity: 0.13, display: 'none'}} className="choice-divider" />
            {/* Recommended Stocks Option */}
            <div style={{
              flex: 1,
              minWidth: 320,
              maxWidth: 520,
              background: 'rgba(255,255,255,0.98)',
              borderRadius: 18,
              boxShadow: '0 2px 12px rgba(102,126,234,0.08)',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              position: 'relative',
              transition: 'box-shadow 0.2s',
            }}>
              <Badge color="linear-gradient(90deg, #2DCE89, #764ba2)">Data Driven</Badge>
              <span style={{fontSize: 32, animation: 'pulse 1.5s infinite', marginBottom: 10}} role="img" aria-label="Recommended">📈</span>
              <div style={{fontWeight: 700, fontSize: 22, color: '#1a202c', marginBottom: 6}}>Recommended Stocks</div>
              <div style={{fontSize: 15, color: '#4a5568', marginBottom: 18}}>
                Get quantitative, data-driven stock recommendations tailored to your portfolio and investment goals.
              </div>
              <ul style={{fontSize: 14, color: '#2DCE89', marginBottom: 18, marginLeft: 18, listStyle: 'disc'}}>
                <li>Smart diversification suggestions</li>
                <li>Growth & value picks</li>
                <li>Personalized for your holdings</li>
              </ul>
              <button
                className="animated-action-button green"
                onClick={() => onChoose('quantitative')}
              >
                See Recommendations
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              className="animated-back-button"
              onClick={onBack}
            >
              ← Back
            </button>
          </div>
        </div>
        {/* Decorative floating icons */}
        {accentIcons.map((item, idx) => (
          <span
            key={idx}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              userSelect: 'none',
              ...item.style,
            }}
          >
            {item.icon}
          </span>
        ))}
      </div>
      <style>{`
        .choice-card-glow:hover {
          box-shadow: 0 0 32px 8px #764ba2cc, 0 8px 32px rgba(102,126,234,0.18);
          transition: box-shadow 0.3s;
        }
        @media (max-width: 1200px) {
          .choice-card-glow { max-width: 98vw !important; }
        }
        @media (max-width: 900px) {
          .choice-card-glow { max-width: 100vw !important; }
        }
        @media (max-width: 900px) {
          .choice-card-glow > div > div[style*='display: flex'] { flex-direction: column !important; gap: 28px !important; }
          .choice-divider { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ChooseAnalysisType; 