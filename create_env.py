#!/usr/bin/env python3
"""
Environment File Creator
This script helps you create a .env file with the correct format.
"""

import os

def create_env_file():
    """Create a .env file with the correct environment variables"""
    
    env_content = """# API Keys and Tokens
# Copy this file to .env and fill in your actual values
# DO NOT commit the .env file to version control

# Hugging Face
HUGGINGFACE_TOKEN=your_huggingface_token_here

# News API
NEWS_API_KEY=your_news_api_key_here

# Finnhub API
FINNHUB_API_KEY=your_finnhub_api_key_here
FINNHUB_API_KEY_FRONTEND=your_finnhub_frontend_api_key_here

# Financial Modeling Prep API
FMP_API_KEY=your_fmp_api_key_here

# Alpha Vantage API (if used)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# Database Configuration (if needed)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
"""
    
    # Check if .env already exists
    if os.path.exists('.env'):
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("❌ Operation cancelled.")
            return
    
    # Create .env file
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully!")
        print("\n📝 Next steps:")
        print("1. Edit the .env file and replace 'your_*_here' with your actual API keys")
        print("2. Make sure .env is in your .gitignore (already done)")
        print("3. Install backend dependencies: cd backend && pip install -r requirements.txt")
        print("4. Start the backend: python main.py")
        print("5. Start the frontend: npm start")
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")

if __name__ == "__main__":
    print("🔐 Environment File Creator")
    print("=" * 40)
    
    print("\nThis script will help you create the necessary environment files.")
    create_env_file()
