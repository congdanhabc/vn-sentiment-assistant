# 🇻🇳 TRỢ LÝ PHÂN LOẠI CẢM XÚC TIẾNG VIỆT
### Vietnamese Sentiment Analysis Assistant

Đồ án môn học: Xây dựng ứng dụng phân loại cảm xúc tiếng Việt sử dụng mô hình Transformer (PhoBERT) kết hợp với giao diện Web hiện đại.

---

## 🚀 Tính năng chính

*   **Phân loại cảm xúc:** Xác định nhãn **Tích cực (POSITIVE)**, **Tiêu cực (NEGATIVE)** hoặc **Trung tính (NEUTRAL)** từ câu tiếng Việt bất kỳ.
*   **Xử lý ngôn ngữ tự nhiên (NLP):**
    *   Sử dụng mô hình **PhoBERT** (biến thể `wonrax/phobert-base-vietnamese-sentiment`) chuyên dụng cho phân tích cảm xúc.
    *   Chuẩn hóa dấu câu tiếng Việt bằng thư viện **Underthesea**.
    *   Tự động xử lý một số từ viết tắt, sai chính tả thông qua từ điển tùy chỉnh (Dictionary-based).
*   **Lưu trữ lịch sử:** Lưu lại các câu đã phân tích vào cơ sở dữ liệu SQLite.
*   **Giao diện hiện đại:** Web App tương tác mượt mà, Responsive.

---

## 🛠️ Công nghệ sử dụng

### Backend (Server)
*   **Ngôn ngữ:** Python 3.10+
*   **Framework:** Flask (RESTful API)
*   **AI/ML:** Hugging Face Transformers, PyTorch
*   **NLP Tools:** Underthesea
*   **Database:** SQLite

### Frontend (Client)
*   **Framework:** React (Vite)
*   **Ngôn ngữ:** TypeScript
*   **Styling:** Tailwind CSS
*   **HTTP Client:** Axios

---

## ⚙️ Cài đặt và Chạy dự án

### Yêu cầu
*   Python (3.8 trở lên)
*   Node.js (v16 trở lên)

### Chạy dự án
1.  Mở Terminal tại thư mục gốc của dự án.
2.  Cài đặt các thư viện:
    ```bash
    npm install

    npm run setup:project
    ```

    ```bash
    npm run setup:project
    ```
3.  Khởi chạy hệ thống:
    ```bash
    npm run dev
    ```
    *   Hệ thống sẽ tự động bật Backend (Port 5000) và Frontend (Port 5173).
    *   Mở trình duyệt và truy cập địa chỉ: http://localhost:5173/.