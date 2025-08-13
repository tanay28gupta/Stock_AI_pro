// Utility functions and constants for components

export const badges = [
  { label: 'Growth', color: 'linear-gradient(90deg, #667eea, #764ba2)' },
  { label: 'AI', color: 'linear-gradient(90deg, #2DCE89, #764ba2)' },
  { label: 'Innovation', color: 'linear-gradient(90deg, #764ba2, #667eea)' },
  { label: 'Clean Energy', color: 'linear-gradient(90deg, #2DCE89, #667eea)' },
  { label: 'E-Commerce', color: 'linear-gradient(90deg, #667eea, #2DCE89)' },
];

export const floatingIcons = [
  { icon: '📈', style: { top: '12%', left: '4%', fontSize: 38, animationDelay: '0s' } },
  { icon: '💹', style: { top: '22%', right: '6%', fontSize: 34, animationDelay: '1.2s' } },
  { icon: '🤑', style: { bottom: '18%', left: '7%', fontSize: 36, animationDelay: '2.1s' } },
  { icon: '🤖', style: { bottom: '10%', right: '8%', fontSize: 40, animationDelay: '0.7s' } },
  { icon: '🌱', style: { top: '38%', left: '2%', fontSize: 32, animationDelay: '1.7s' } },
  { icon: '🏦', style: { bottom: '28%', right: '3%', fontSize: 32, animationDelay: '2.7s' } },
];

export const features = [
  {
    icon: "🤖",
    title: "AI-Powered Sentiment Analysis",
    desc: "Understand the mood of the market with real-time news sentiment across your portfolio."
  },
  {
    icon: "🧠",
    title: "Quantitative Stock Recommendations",
    desc: "Discover new investment opportunities based on the beta and market cap profile of your portfolio."
  }
];

export const howItWorksSteps = [
  {
    icon: "🔍",
    title: "1. Portfolio Input",
    desc: "Enter your investment portfolios and stock holdings into our secure, user-friendly dashboard. You can add multiple portfolios, each with its own set of stocks and allocations."
  },
  {
    icon: "🛰️",
    title: "2. Real-Time Data Gathering",
    desc: "Our AI instantly fetches the latest news, financial reports, and social media sentiment for every stock in your portfolios, ensuring you always have up-to-date information."
  },
  {
    icon: "🤖",
    title: "3. AI Sentiment Analysis",
    desc: "Advanced natural language processing (NLP) models analyze news, financial articles, and social data to determine the market mood for each stock, scoring them from highly negative to highly positive."
  },
  {
    icon: "📈",
    title: "4. Quantitative Calculations",
    desc: "We calculate risk, diversification, and opportunity using statistical models, beta, volatility, and market cap data. Our algorithms identify hidden risks and growth opportunities."
  },
  {
    icon: "💡",
    title: "5. Personalized Insights & Recommendations",
    desc: "You receive actionable insights, risk alerts, and smart stock recommendations, tailored to your goals, risk profile, and current market conditions."
  }
];

export const aiIcons = ["🤖", "🧠", "📈", "🛰️", "💡", "📊", "🔬", "📉", "📰"];

export function getPortfolioIcon(name = "") {
  if (!name) return "📈";
  if (name.toLowerCase().includes("tech")) return "💻";
  if (name.toLowerCase().includes("green") || name.toLowerCase().includes("energy")) return "🌱";
  if (name.toLowerCase().includes("bank") || name.toLowerCase().includes("finance")) return "🏦";
  if (name.toLowerCase().includes("health") || name.toLowerCase().includes("medical")) return "🏥";
  if (name.toLowerCase().includes("consumer") || name.toLowerCase().includes("retail")) return "🛒";
  if (name.toLowerCase().includes("emerging") || name.toLowerCase().includes("international")) return "��";
  return "📈";
} 