import React from "react";

const Badge = ({ children, color }) => (
  <span style={{
    display: 'inline-block',
    background: color || 'linear-gradient(90deg, #667eea, #764ba2)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
    padding: '2px 10px',
    marginBottom: 8,
    marginRight: 8,
    letterSpacing: '0.01em',
    boxShadow: '0 1px 4px rgba(102,126,234,0.13)',
    border: 'none',
  }}>{children}</span>
);

export default Badge; 