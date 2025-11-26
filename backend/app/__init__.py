from flask import Flask
from flask_cors import CORS
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Cho phép mọi nguồn (CORS) để dễ test
    CORS(app)
    
    # Đăng ký các routes
    from app.routes import main_bp
    app.register_blueprint(main_bp)
    
    return app