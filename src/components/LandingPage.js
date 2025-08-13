import React, { useRef, useState } from "react";
import "../styles/landingPage.css";
import Button from "./Button";
import { features, howItWorksSteps, aiIcons } from "./utils";

const LandingPage = ({ onStart }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const howItWorksRef = useRef(null);

  const handleHowItWorks = () => {
    setShowHowItWorks(true);
    setTimeout(() => {
      if (howItWorksRef.current) {
        howItWorksRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 250);
  };

  return (
    <div className="landing-bg-root">
      {/* Animated blobs */}
      <div className="landing-blobs">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
      </div>
      <div className="landing-hero-new">
        <div className="landing-hero-icon">🔍</div>
        <h1 className="landing-hero-headline">
          Smarter Stock Decisions with<br />
          <span className="gradient-text">AI-Driven Insights</span>
        </h1>
        <p className="landing-hero-subheadline">
          Combine real-time sentiment analysis with data-backed stock recommendations to manage your portfolio like a pro.
        </p>
        <div className="landing-hero-btn-row">
          <Button className="hero-btn hero-btn-primary" variant="primary" size="large" onClick={onStart}>Get Started Now</Button>
          <Button className="hero-btn hero-btn-secondary" variant="secondary" size="large" onClick={handleHowItWorks}>How It Works</Button>
        </div>
      </div>
      <div className="landing-features-row">
        {features.map((f, i) => (
          <div className="landing-feature-card" key={i}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
      {/* Spacious How It Works Section */}
      {showHowItWorks && (
        <section className="how-it-works-animated-section" ref={howItWorksRef}>
          <h2 className="how-it-works-title">How Stock Insight Pro Works</h2>
          <div className="how-it-works-grid-custom">
            {/* Steps 1-3 in a row */}
            <div className="how-it-works-row-center">
              {howItWorksSteps.slice(0, 3).map((step, i) => (
                <div className="how-it-works-step-card" key={i} style={{ animationDelay: `${0.1 * i}s`, margin: '0 18px' }}>
                  <div className="how-it-works-step-icon">{step.icon}</div>
                  <div className="how-it-works-step-title">{step.title}</div>
                  <div className="how-it-works-step-desc">{step.desc}</div>
                </div>
              ))}
            </div>
            {/* Steps 4 and 5 in a row */}
            <div className="how-it-works-row-center">
              {howItWorksSteps.slice(3, 5).map((step, i) => (
                <div className="how-it-works-step-card" key={3 + i} style={{ animationDelay: `${0.1 * (3 + i)}s`, margin: '0 18px' }}>
                  <div className="how-it-works-step-icon">{step.icon}</div>
                  <div className="how-it-works-step-title">{step.title}</div>
                  <div className="how-it-works-step-desc">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="how-it-works-visuals">
            <div className="how-it-works-ai-glow" />
            <div className="how-it-works-ai-brain">
              {aiIcons.map((icon, i) => (
                <span key={i} className="ai-icon-float" style={{ left: `${30 + 40 * Math.cos((i / aiIcons.length) * 2 * Math.PI)}px`, top: `${30 + 40 * Math.sin((i / aiIcons.length) * 2 * Math.PI)}px`, animationDelay: `${i * 0.18}s` }}>{icon}</span>
              ))}
              🧠
            </div>
            <div className="how-it-works-visual-desc">
              <strong>AI + Quantitative Analysis:</strong> Our platform combines advanced AI models (NLP, sentiment analysis, anomaly detection) with financial calculations (beta, risk, diversification, volatility) to deliver the ultimate insights and recommendations for your portfolio. All data is processed securely and privately, ensuring your information is always protected.
            </div>
            <div className="how-it-works-cta-row">
              <Button className="hero-btn hero-btn-primary" variant="primary" size="large" onClick={onStart} style={{marginTop: 24, fontSize: '1.1rem'}}>Start Your AI-Powered Analysis</Button>
            </div>
          </div>
        </section>
      )}
      <div className="landing-gradient-bar" />
    </div>
  );
};

export default LandingPage;
