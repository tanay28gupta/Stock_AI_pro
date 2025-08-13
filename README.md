# Portfolio Sentiment Analysis Project

A full-stack web application that analyzes sentiment of financial news for portfolio stocks using AI-powered sentiment analysis.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL database

### Environment Setup
**IMPORTANT**: Before running the project, you need to set up your environment variables.

1. **Run the setup script**: `python create_env.py`
2. **Edit the generated `.env` file** with your actual API keys
3. **Install dependencies** (see below)

For detailed environment setup instructions, see [SETUP_ENV.md](SETUP_ENV.md).

### Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend Setup
```bash
npm install
```

### Running the Application

#### Start Backend
```bash
cd backend
python main.py
```

#### Start Frontend (in a new terminal)
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔑 Required API Keys

- **Hugging Face**: For FinBERT sentiment analysis
- **News API**: For financial news articles
- **Finnhub**: For stock market data
- **Financial Modeling Prep**: For company metrics

## 🏗️ Project Structure

```
├── backend/                 # Python Flask backend
│   ├── routes/             # API endpoints
│   ├── utils/              # Utility functions
│   ├── config.py           # Configuration management
│   └── main.py             # Main application
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/           # API services
│   └── styles/             # CSS stylesheets
└── .env                    # Environment variables (create this)
```

## 🔒 Security

- All API keys are stored in environment variables
- `.env` file is automatically ignored by git
- No sensitive data is committed to version control

---

**This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).**

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
