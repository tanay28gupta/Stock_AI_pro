import React, { useState, useEffect, useRef } from "react";
import { aiIcons } from "./utils";

const sentimentCodeLines = [
  "System Boot: ✓",
  "Connecting to News & Social APIs...",
  "→ Streaming real-time headlines...",
  "→ Analyzing article content for tone...",
  "→ Processing social media feeds for sentiment...",
  "→ Identifying keywords and entities...",
  "→ Calculating weighted sentiment scores...",
  "→ Compiling portfolio-level analysis...",
  "Sentiment Engine Ready.",
  "Insights compiled successfully."
];

const sentimentHeaderStages = [
  "Initializing Sentiment AI...",
  "Gathering Market News...",
  "Analyzing Language...",
  "Calculating Sentiment...",
  "Analysis Complete."
];

const SentimentLoadingAnimation = () => {
  const [typedLines, setTypedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (currentLineIndex < sentimentCodeLines.length) {
      typeLine(sentimentCodeLines[currentLineIndex]);
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
        const newProgress = Math.round(((currentLineIndex + 1) / sentimentCodeLines.length) * 100);
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

  const currentHeader = sentimentHeaderStages[Math.min(Math.floor((progress / 100) * sentimentHeaderStages.length), sentimentHeaderStages.length - 1)];

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "900px",
        margin: "40px auto",
        background: "linear-gradient(120deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(102, 126, 234, 0.13)",
        color: "#fff",
        fontFamily: "'Fira Code', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10, textAlign: 'center', fontWeight: 600 }}>
        {currentHeader}
      </div>

      <div style={{ fontSize: 48, marginBottom: 12, animation: 'pulsePurple 1.5s infinite alternate', textAlign: 'center' }}>
        {aiIcons[currentIcon]}
      </div>

      <div
        ref={terminalRef}
        style={{
          background: "#1a202c", // Darker background
          padding: "16px",
          borderRadius: "10px",
          border: "1px solid #764ba2",
          height: "220px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          boxShadow: "0 0 12px #764ba244 inset",
        }}
      >
        {typedLines.map((line, index) => (
          <div key={index} style={{ color: "#a3bffa", marginBottom: "4px" }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, width: "100%", height: "12px", background: "#2d3748", borderRadius: 6 }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #a3bffa, #fbcfe8)",
            borderRadius: 6,
            transition: "width 0.5s ease",
            boxShadow: "0 0 8px #a3bffa",
          }}
        />
      </div>

      <div style={{ marginTop: 14, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>
        Progress: {progress}%
      </div>

      <style>{`
        @keyframes pulsePurple {
          0% { transform: scale(1); filter: drop-shadow(0 0 8px #a3bffa); }
          100% { transform: scale(1.05); filter: drop-shadow(0 0 16px #a3bffa); }
        }
      `}</style>
    </div>
  );
};

export default SentimentLoadingAnimation; 