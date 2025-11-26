from flask import Blueprint, request, jsonify
from app.services import TextService
from app.models import SentimentModel

# Tạo Blueprint (nhóm các route lại)
main_bp = Blueprint('main', __name__)
db = SentimentModel()

@main_bp.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running!"})

@main_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Thiếu trường 'text'"}), 400
    
    raw_text = data['text']
    
    # Validate
    if len(raw_text.strip()) < 5:
        return jsonify({"error": "Câu quá ngắn (< 5 ký tự)"}), 400

    # 1. Gọi Service xử lý
    clean_text = TextService.normalize(raw_text)
    sentiment = TextService.predict_sentiment(clean_text)

    # 2. Gọi Model lưu DB
    db.save_result(raw_text, sentiment)

    # 3. Trả kết quả
    return jsonify({
        "text": raw_text,
        "clean_text": clean_text,
        "sentiment": sentiment
    })

@main_bp.route('/history', methods=['GET'])
def history():
    data = db.get_history()
    return jsonify(data)