import React, { useState } from "react";
import "../styles/titleBar.css";
import { ReactComponent as Logo } from "../logo.svg";
import HamburgerMenu from "./HamburgerMenu";
import Button from "./Button";

const TitleBar = ({ onHome, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="title-bar-navbar">
      <div className="title-bar-left">
        <Button
          className="title-bar-hamburger"
          aria-label="Open navigation menu"
          onClick={() => setMenuOpen(true)}
          variant="outline"
          size="small"
          style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, minWidth: 36, minHeight: 36 }}
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </Button>
      </div>
      <div className="title-bar-center">
        <span className="title-bar-logo">
          <Logo style={{ width: 32, height: 32, verticalAlign: 'middle', marginRight: 8 }} />
          <span className="title-bar-title">Stock Insight Pro</span>
        </span>
      </div>
      <div className="title-bar-right">
        <span className="title-bar-user" title="Account">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="14" fill="#667eea" />
            <ellipse cx="14" cy="11" rx="5" ry="5.5" fill="#fff" />
            <ellipse cx="14" cy="21" rx="8" ry="4" fill="#fff" />
          </svg>
        </span>
      </div>
      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={page => {
          if (page === "landing" && onHome) onHome();
          else if (onNavigate) onNavigate(page);
          setMenuOpen(false);
        }}
      />
    </header>
  );
};

export default TitleBar;
