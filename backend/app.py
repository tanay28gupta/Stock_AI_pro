from flask import Flask
from flask_cors import CORS
from routes.api_routes import api_bp

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

# Register the API blueprint
app.register_blueprint(api_bp)

if __name__ == '__main__':
    print("🚀 Starting Flask backend server...")
    print("📍 Backend will be available at: http://localhost:5000")
    app.run(debug=True, use_reloader=False) 