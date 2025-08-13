import React from "react";
import "../styles/hamburgerMenu.css";
import Button from "./Button";

const navLinks = [
  { label: "Home", page: "landing", icon: "🏠" },
  { label: "Portfolio", page: "input", icon: "💼" },
  { label: "Sentiment Analysis", page: "analysis", icon: "🧠" },
  { label: "Recommendations", page: "quantitative", icon: "📊" },
];

const HamburgerMenu = ({ open, onClose, onNavigate }) => {
  return (
    <div className={`hamburger-menu-overlay${open ? " open" : ""}`} onClick={onClose}>
      <aside
        className={`hamburger-menu-box${open ? " open" : ""}`}
        onClick={e => e.stopPropagation()}
        aria-label="Navigation menu"
      >
        <Button className="hamburger-menu-close" onClick={onClose} aria-label="Close menu" variant="outline" size="small">✕</Button>
        <nav className="hamburger-menu-list">
          {navLinks.map(link => (
            <Button
              key={link.page}
              className="hamburger-menu-link"
              onClick={() => { onNavigate && onNavigate(link.page); onClose && onClose(); }}
              variant="secondary"
              size="medium"
            >
              <span className="hamburger-menu-link-icon">{link.icon}</span>
              <span className="hamburger-menu-link-label">{link.label}</span>
            </Button>
          ))}
        </nav>
        <div className="hamburger-menu-footer">
          <span style={{ color: '#667eea', fontWeight: 700, fontSize: 13 }}>Stock Insight Pro</span>
        </div>
      </aside>
    </div>
  );
};

export default HamburgerMenu; 