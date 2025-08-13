import requests
from config import NEWS_API_KEY, NEWS_API_URL

def fetch_news(query, page_size=5):
    try:
        params = {
            'q': query,
            'language': 'en',
            'sortBy': 'relevancy',
            'pageSize': page_size,
            'apiKey': NEWS_API_KEY
        }
        response = requests.get(NEWS_API_URL, params=params)
        if response.status_code != 200:
            print(f"❌ News API error: {response.status_code} - {response.text}")
            raise RuntimeError(f"News fetch failed: {response.status_code} — {response.text}")
        articles = response.json().get('articles', [])
        print(f"✅ Fetched {len(articles)} articles for '{query}'")
        return articles
    except Exception as e:
        print(f"❌ Error fetching news for '{query}': {e}")
        return [] 