import React, { useState, useEffect, useRef } from "react";
import { aiIcons } from "./utils";

const codeLines = [
  "System Boot: ✓",
  "Loading Financial Models...",
  "→ Fetching portfolio data...",
  "→ Calculating beta, alpha, and Sharpe ratio...",
  "→ Running Monte Carlo simulations...",
  "→ Analyzing earnings surprise trends...",
  "→ Filtering based on analyst recommendations...",
  "→ Sorting by risk-adjusted return...",
  "Finalizing recommendation engine...",
  "System Ready: All set to deliver insights."
];

const headerStages = [
  "Initializing System...",
  "Crunching Market Data...",
  "Running AI Models...",
  "Optimizing Recommendations...",
  "System Ready."
];

const LoadingAnimation = () => {
  const [typedLines, setTypedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (currentLineIndex < codeLines.length) {
      typeLine(codeLines[currentLineIndex]);
    }
  }, [currentLineIndex]);

  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % aiIcons.length);
    }, 600);

    return () => clearInterval(iconInterval);
  }, []);

  const typeLine = (line) => {
    let currentText = "";
    let i = 0;
    const interval = setInterval(() => {
      currentText += line.charAt(i);
      i++;
      setTypedLines((prev) => [...prev.slice(0, currentLineIndex), currentText + "|"]);
      if (i === line.length) {
        clearInterval(interval);
        setTypedLines((prev) => [...prev.slice(0, currentLineIndex), line]);
        const newProgress = Math.round(((currentLineIndex + 1) / codeLines.length) * 100);
        setProgress(newProgress);
        setCurrentLineIndex((prev) => prev + 1);
      }
    }, 40);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [typedLines]);

  const currentHeader = headerStages[Math.min(Math.floor((progress / 100) * headerStages.length), headerStages.length - 1)];

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "900px",
        margin: "40px auto",
        background: "linear-gradient(120deg, #2DCE89 0%, #667eea 100%)",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(45,206,137,0.13)",
        color: "#fff",
        fontFamily: "'Fira Code', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10, textAlign: 'center', fontWeight: 600 }}>
        {currentHeader}
      </div>

      <div style={{ fontSize: 48, marginBottom: 12, animation: 'pulse 1.5s infinite alternate', textAlign: 'center' }}>
        {aiIcons[currentIcon]}
      </div>

      <div
        ref={terminalRef}
        style={{
          background: "#000",
          padding: "16px",
          borderRadius: "10px",
          border: "1px solid #2DCE89",
          height: "220px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          boxShadow: "0 0 12px #2DCE8944 inset",
        }}
      >
        {typedLines.map((line, index) => (
          <div key={index} style={{ color: "#2DCE89", marginBottom: "4px" }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, width: "100%", height: "12px", background: "#222", borderRadius: 6 }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #2DCE89, #667eea)",
            borderRadius: 6,
            transition: "width 0.5s ease",
            boxShadow: "0 0 8px #2DCE89",
          }}
        />
      </div>

      <div style={{ marginTop: 14, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>
        Progress: {progress}%
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); filter: drop-shadow(0 0 8px #2DCE89); }
          100% { transform: scale(1.05); filter: drop-shadow(0 0 16px #2DCE89); }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
