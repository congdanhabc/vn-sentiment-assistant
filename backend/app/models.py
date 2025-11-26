import sqlite3
import datetime
from app.config import Config

class SentimentModel:
    def __init__(self):
        self.db_path = Config.DATABASE_URI
        self.init_table()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_table(self):
        """Tạo bảng nếu chưa có"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sentiments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    text_input TEXT,
                    sentiment_label TEXT,
                    timestamp TEXT
                )
            """)
            conn.commit()

    def save_result(self, text, sentiment):
        """Lưu kết quả phân tích"""
        timestamp = datetime.datetime.now().isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO sentiments (text_input, sentiment_label, timestamp) VALUES (?, ?, ?)", 
                (text, sentiment, timestamp)
            )
            conn.commit()

    def get_history(self, limit=50):
        """Lấy lịch sử"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, text_input, sentiment_label, timestamp FROM sentiments ORDER BY timestamp DESC LIMIT ?", 
                (limit,)
            )
            rows = cursor.fetchall()
        
        # Convert tuple sang dict để trả về JSON
        return [
            {"id": r[0], "text": r[1], "sentiment": r[2], "timestamp": r[3]} 
            for r in rows
        ]