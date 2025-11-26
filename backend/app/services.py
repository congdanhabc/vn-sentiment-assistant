import json
import os
from transformers import pipeline
from app.config import Config

# 1. LOAD TỪ ĐIỂN ---
def load_replacement_dict():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, '../replacement_dict.json')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

REPLACEMENT_DICT = load_replacement_dict()


# 2. Khởi tạo Model
print("Đang tải AI Model...")
sentiment_pipeline = pipeline("sentiment-analysis", model=Config.MODEL_NAME)
print("AI Model đã sẵn sàng!")

class TextService:
    @staticmethod
    def normalize(text: str) -> str:
        """Chuẩn hóa văn bản tiếng Việt"""
        text = text.lower()
        words = text.split()
        fixed_words = [REPLACEMENT_DICT.get(word, word) for word in words]
        return " ".join(fixed_words)

    @staticmethod
    def predict_sentiment(text: str):
        """Dự đoán cảm xúc"""
        try:
            # Model trả về dạng: [{'label': 'POS', 'score': 0.99}]
            result = sentiment_pipeline(text)[0]
            
            # Mapping nhãn
            label_map = {"POS": "POSITIVE", "NEG": "NEGATIVE", "NEU": "NEUTRAL"}
            sentiment = label_map.get(result['label'], "NEUTRAL")

            # Logic phụ: Score thấp thì cho là trung tính
            if result['score'] < 0.5:
                sentiment = "NEUTRAL"
            
            return sentiment
        except Exception as e:
            print(f"Lỗi AI: {e}")
            return "NEUTRAL"