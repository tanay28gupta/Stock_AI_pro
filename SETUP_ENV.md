# Environment Setup Guide

This guide will help you set up the environment variables needed to run this project securely.

## ⚠️ Important Security Notice

**NEVER commit API keys, tokens, or other sensitive information to version control!** 
This project has been configured to use environment variables to keep your secrets safe.

## 🔑 Required API Keys

You'll need the following API keys to run this project:

### 1. Hugging Face Token
- **Purpose**: Sentiment analysis using FinBERT model
- **Get it from**: [Hugging Face](https://huggingface.co/settings/tokens)
- **Environment variable**: `HUGGINGFACE_TOKEN`

### 2. News API Key
- **Purpose**: Fetching financial news articles
- **Get it from**: [News API](https://newsapi.org/register)
- **Environment variable**: `NEWS_API_KEY`

### 3. Finnhub API Key
- **Purpose**: Stock market data and company information
- **Get it from**: [Finnhub](https://finnhub.io/register)
- **Environment variable**: `FINNHUB_API_KEY`

### 4. Financial Modeling Prep API Key
- **Purpose**: Company financial metrics
- **Get it from**: [Financial Modeling Prep](https://financialmodelingprep.com/developer)
- **Environment variable**: `FMP_API_KEY`

### 5. Alpha Vantage API Key (Optional)
- **Purpose**: Additional financial data
- **Get it from**: [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
- **Environment variable**: `ALPHA_VANTAGE_API_KEY`

## 🚀 Setup Instructions

### Step 1: Create Environment File

1. In your project root directory, create a file named `.env`
2. **DO NOT** commit this file to git (it's already in `.gitignore`)

### Step 2: Add Your API Keys

Copy the following template to your `.env` file and fill in your actual API keys:

```bash
# API Keys and Tokens
HUGGINGFACE_TOKEN=your_huggingface_token_here
NEWS_API_KEY=your_news_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
FINNHUB_API_KEY_FRONTEND=your_finnhub_frontend_api_key_here
FMP_API_KEY=your_fmp_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# Database Configuration (if needed)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

### Step 3: Frontend Environment Variables

For React frontend, create a `.env` file in the project root with:

```bash
REACT_APP_FINNHUB_API_KEY=your_finnhub_api_key_here
REACT_APP_API_BASE_URL=http://localhost:5000
```

**Note**: React environment variables must start with `REACT_APP_`

### Step 4: Install Dependencies

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
cd ..
npm install
```

### Step 5: Verify Configuration

The project will automatically validate your environment variables when you start the backend. You should see:

```
✅ Configuration validated successfully
```

If you see warnings about missing variables, check your `.env` file.

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys** regularly
4. **Monitor API usage** to prevent quota exhaustion
5. **Use environment-specific files** (`.env.development`, `.env.production`)

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found: config"**
   - Make sure you're running from the correct directory
   - Check that `config.py` exists in the backend folder

2. **"Missing environment variables"**
   - Verify your `.env` file exists and has the correct format
   - Check that variable names match exactly (case-sensitive)

3. **API rate limiting**
   - Check your API quotas
   - Consider upgrading your API plans if needed

### Testing Your Setup

1. **Backend**: Run `python main.py` and check for configuration validation
2. **Frontend**: Check browser console for any API key errors
3. **API endpoints**: Test sentiment analysis and news fetching

## 📝 Example .env File

Here's a complete example (replace with your actual keys):

```bash
# Hugging Face
HUGGINGFACE_TOKEN=hf_your_actual_token_here

# News API
NEWS_API_KEY=your_actual_news_api_key

# Finnhub
FINNHUB_API_KEY=your_actual_finnhub_key
FINNHUB_API_KEY_FRONTEND=your_actual_finnhub_key

# Financial Modeling Prep
FMP_API_KEY=your_actual_fmp_key

# Alpha Vantage (optional)
ALPHA_VANTAGE_API_KEY=your_actual_alpha_vantage_key

# Database (if using custom database)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio_db
```

## 🎯 Next Steps

After setting up your environment variables:

1. Start the backend: `cd backend && python main.py`
2. Start the frontend: `npm start`
3. Test the application functionality
4. Check that sentiment analysis and news fetching work correctly

## 📞 Support

If you encounter issues:

1. Check the console output for error messages
2. Verify all API keys are correct and active
3. Ensure your `.env` file is in the correct location
4. Check that all dependencies are installed

---

**Remember**: Keep your API keys secure and never share them publicly!
