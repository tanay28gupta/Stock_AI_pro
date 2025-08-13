import React from "react";
import "../styles/Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  icon,
  disabled = false,
  onClick,
  style,
  ...rest
}) => (
  <button
    className={`custom-btn ${variant} ${size}`}
    disabled={disabled}
    onClick={onClick}
    style={style}
    {...rest}
  >
    {icon && <span className="btn-icon">{icon}</span>}
    {children}
  </button>
);

export default Button; 