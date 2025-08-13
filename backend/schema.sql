-- Stock Portfolio Analyzer Database Schema
-- Run this file in MySQL to set up the database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS stock_trading_app;
USE stock_trading_app;

-- User table
CREATE TABLE IF NOT EXISTS user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
    portfolio_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    portfolio_name VARCHAR(100) NOT NULL,
    avg_port_sent_score DECIMAL(5,4),
    min_beta DECIMAL(5,2),
    max_beta DECIMAL(5,2),
    min_market_cap BIGINT,
    max_market_cap BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Stock table
CREATE TABLE IF NOT EXISTS stock (
    stock_id INT PRIMARY KEY AUTO_INCREMENT,
    portfolio_id INT,
    stock_ticker VARCHAR(10) NOT NULL,
    stock_name VARCHAR(100) NOT NULL,
    avg_stock_sent_score DECIMAL(5,4),
    market_cap BIGINT,
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id) ON DELETE CASCADE
);

-- News table for storing news articles and sentiment scores
CREATE TABLE IF NOT EXISTS news (
    news_id INT PRIMARY KEY AUTO_INCREMENT,
    stock_ticker VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    url VARCHAR(500),
    sent_score DECIMAL(5,4),
    date_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_stock_url (stock_ticker, url)
);

-- Recommendation table
CREATE TABLE IF NOT EXISTS recommendation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    portfolio_id INT,
    stock_ticker VARCHAR(10) NOT NULL,
    beta DECIMAL(5,2),
    market_cap BIGINT,
    eps DECIMAL(10,2),
    pe_ratio DECIMAL(10,2),
    company_name VARCHAR(100),
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id) ON DELETE CASCADE,
    UNIQUE KEY unique_portfolio_stock (portfolio_id, stock_ticker)
);


-- Create indexes for better performance
CREATE INDEX idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX idx_stock_portfolio_id ON stock(portfolio_id);
CREATE INDEX idx_news_stock_ticker ON news(stock_ticker);
CREATE INDEX idx_news_created_at ON news(created_at);

-- Show tables
SHOW TABLES;

-- Show default user
SELECT * FROM user; 