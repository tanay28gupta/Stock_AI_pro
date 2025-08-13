import React from "react";

const Brain = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 18px #764ba2cc)' }}>
    <ellipse cx="40" cy="40" rx="32" ry="28" fill="#fff" opacity="0.13" />
    <ellipse cx="40" cy="40" rx="28" ry="24" fill="#764ba2" opacity="0.18" />
    <ellipse cx="40" cy="40" rx="22" ry="18" fill="#667eea" opacity="0.22" />
    <path d="M30 50 Q28 40 40 38 Q52 36 50 50" stroke="#764ba2" strokeWidth="3" fill="none" />
    <ellipse cx="34" cy="44" rx="2.5" ry="2.5" fill="#fff" />
    <ellipse cx="46" cy="44" rx="2.5" ry="2.5" fill="#fff" />
    <ellipse cx="40" cy="38" rx="7" ry="5" fill="#fff" opacity="0.7" />
    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
  </svg>
);

export default Brain; 