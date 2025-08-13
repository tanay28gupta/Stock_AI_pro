const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log(`📤 Request body:`, JSON.parse(options.body));
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log(`📥 API Response: ${response.status} ${url}`);
      console.log(`📊 Response data:`, data);
      
      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} - ${data.error || 'Unknown error'}`);
        // Return the error object so the frontend can display it
        return { success: false, error: data.error || `HTTP error! status: ${response.status}` };
      }
      
      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Save portfolios to database
  async savePortfolios(portfolios, userId = 1) {
    return this.makeRequest('/save-portfolios', {
      method: 'POST',
      body: JSON.stringify({
        portfolios,
        user_id: userId
      })
    });
  }

  // Analyze portfolios and get sentiment scores
  async analyzePortfolios(userId = 1) {
    return this.makeRequest(`/analyze-portfolios/${userId}`, {
      method: 'POST'
    });
  }

  // Get existing portfolios with sentiment scores
  async getPortfolios(userId = 1) {
    return this.makeRequest(`/get-portfolios/${userId}`, {
      method: 'GET'
    });
  }

  // Get recommendations for a user
  async getRecommendations(userId = 1) {
    return this.makeRequest(`/recommendations/${userId}`, {
      method: 'POST'
    });
  }

  // Health check endpoint
  async healthCheck() {
    return this.makeRequest('/health', {
      method: 'GET'
    });
  }

  // Clear all data for a user
  async clearAllData(userId = 1) {
    return this.makeRequest(`/clear-all-data/${userId}`, {
      method: 'DELETE'
    });
  }

  // Fetch news articles for a given stock ticker
  async getNewsForStock(stockTicker) {
    return this.makeRequest(`/news/${stockTicker}`, {
      method: 'GET'
    });
  }
}

export default new ApiService(); 