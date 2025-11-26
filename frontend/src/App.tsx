import { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu khớp với JSON từ Backend trả về
interface AnalysisResult {
  text: string;
  clean_text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

interface HistoryItem {
  id: number;
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  timestamp: string;
}

// URL của Backend Flask
const API_URL = "http://localhost:5000";

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Hàm lấy lịch sử
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Không kết nối được Backend:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. Hàm xử lý nút "Phân loại"
  const handleAnalyze = async () => {
    if (!inputText || inputText.trim().length < 5) {
      setError("⚠️ Câu quá ngắn, vui lòng nhập ít nhất 5 ký tự!");
      return;
    }
    
    setError('');
    setLoading(true);
    setResult(null);

    try {
      // Gọi API Backend
      const res = await axios.post(`${API_URL}/analyze`, {
        text: inputText
      });
      
      setResult(res.data); // Lưu kết quả
      setInputText('');    // Xóa ô nhập
      fetchHistory();      // Cập nhật lại bảng lịch sử ngay lập tức
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      
      const msg = error.response?.data?.error || "❌ Lỗi kết nối Server!";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Chỉnh màu cho các sentiment
  const getBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-green-100 text-green-700 border-green-400';
      case 'NEGATIVE': return 'bg-red-100 text-red-700 border-red-400';
      default: return 'bg-gray-100 text-gray-700 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Trợ Lý Cảm Xúc Tiếng Việt 🇻🇳
          </h1>
          <p className="mt-2 text-slate-500">
            Sử dụng AI Transformer (PhoBERT) & Flask Backend
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nhập câu tiếng Việt:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="VD: Hôm nay tôi rat vui..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : 'Phân loại'}
            </button>
          </div>
          {error && <p className="mt-3 text-red-600 text-sm font-medium animate-pulse">{error}</p>}
        </div>

        {/* RESULT AREA */}
        {result && (
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-indigo-500 animate-fade-in-up">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kết quả phân tích</h3>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-lg text-slate-800 font-medium">"{result.text}"</p>
                {/* Hiển thị luôn câu đã chuẩn hóa để GV thấy chức năng xử lý text */}
                <p className="text-sm text-slate-500 mt-1">
                  💡 Đã chuẩn hóa: <span className="italic">{result.clean_text}</span>
                </p>
              </div>
              
              <span className={`px-5 py-2 rounded-full text-sm font-bold border ${getBadgeColor(result.sentiment)} shadow-sm`}>
                {result.sentiment}
              </span>
            </div>
          </div>
        )}

        {/* HISTORY TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-700">Lịch sử hoạt động</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3">Thời gian</th>
                  <th className="px-6 py-3">Nội dung gốc</th>
                  <th className="px-6 py-3">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString('vi-VN')} - {new Date(item.timestamp).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium truncate max-w-[200px]" title={item.text}>
                      {item.text}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(item.sentiment)}`}>
                        {item.sentiment}
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                      Chưa có dữ liệu. Hãy thử nhập một câu!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;