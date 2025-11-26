import os

class Config:
    # Đường dẫn file DB
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_URI = os.path.join(BASE_DIR, '../database.db')
    
    # Tên model AI
    MODEL_NAME = "wonrax/phobert-base-vietnamese-sentiment"
    
    # Cấu hình server
    DEBUG = False