import { useState, useEffect } from 'react';
import axios from 'axios';

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

const API_URL = "http://localhost:5000";
const PAGE_SIZE = 50;

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State mới cho chức năng Tải thêm
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true); // Còn dữ liệu để tải không?
  const [loadingMore, setLoadingMore] = useState(false);

  // Hàm tải lịch sử (Có 2 chế độ: Làm mới hoặc Tải thêm)
  const fetchHistory = async (isLoadMore = false) => {
    try {
      const currentOffset = isLoadMore ? offset : 0;
      if (isLoadMore) setLoadingMore(true);

      const res = await axios.get(`${API_URL}/history`, {
        params: { offset: currentOffset }
      });
      
      const newData = res.data;

      if (isLoadMore) {
        // Nếu là tải thêm -> Nối dữ liệu cũ + mới
        setHistory(prev => [...prev, ...newData]);
        setOffset(prev => prev + PAGE_SIZE);
      } else {
        // Nếu là làm mới -> Thay thế hoàn toàn
        setHistory(newData);
        setOffset(PAGE_SIZE);
      }

      // Nếu dữ liệu trả về ít hơn PAGE_SIZE nghĩa là đã hết dữ liệu
      if (newData.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (err) {
      console.error("Lỗi kết nối Backend:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Chạy lần đầu
  useEffect(() => {
    fetchHistory(false);
  }, []);

  const handleAnalyze = async () => {
    if (!inputText || inputText.trim().length < 5) {
      setError("⚠️ Câu quá ngắn, hãy nhập ít nhất 5 ký tự!");
      return;
    }
    
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/analyze`, { text: inputText });
      setResult(res.data);
      setInputText('');
      // Sau khi phân tích xong, reload lại bảng lịch sử về trang 1
      fetchHistory(false); 
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            const msg = err.response?.data?.error || "❌ Lỗi kết nối Server!";
            setError(msg);
        } else {
            setError("❌ Đã xảy ra lỗi không xác định!");
        }
    } finally {
      setLoading(false);
    }
  };

  const getColors = (sentiment: string) => {
    if (sentiment === 'POSITIVE') return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (sentiment === 'NEGATIVE') return 'bg-rose-100 text-rose-700 border-rose-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-900 tracking-tight">
            Vietnamese Sentiment AI 🇻🇳
          </h1>
          <p className="text-slate-500 font-medium">Phân loại cảm xúc sử dụng PhoBERT & Flask</p>
        </div>

        {/* Input Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-indigo-100/50 border border-indigo-50">
          <label className="block text-sm font-semibold text-slate-600 mb-3">
            Nhập câu tiếng Việt của bạn:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="VD: Dự án này làm tôi rất vui..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Phân loại'}
            </button>
          </div>
          {error && <p className="mt-3 text-red-500 text-sm font-medium flex items-center gap-1">🚫 {error}</p>}
        </div>

        {/* Result Card */}
        {result && (
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-indigo-500 animate-fade-in-up">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Kết quả phân tích</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-lg font-medium text-slate-800">"{result.text}"</p>
                <p className="text-xs text-slate-400">Đã chuẩn hóa: {result.clean_text}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getColors(result.sentiment)}`}>
                {result.sentiment}
              </span>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Lịch sử phân loại</h3>
            <span className="text-xs text-slate-400">Hiển thị {history.length} bản ghi</span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <p className="text-center py-8 text-slate-400 italic">Chưa có dữ liệu nào.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-slate-50 transition-colors flex justify-between items-center animate-fade-in-up">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-slate-800 font-medium truncate">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString('vi-VN')} - {new Date(item.timestamp).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${getColors(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* NÚT TẢI THÊM (LOAD MORE) */}
          {hasMore && history.length > 0 && (
            <div className="p-4 text-center border-t border-slate-100">
              <button 
                onClick={() => fetchHistory(true)}
                disabled={loadingMore}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold hover:underline disabled:opacity-50"
              >
                {loadingMore ? 'Đang tải thêm...' : '👇 Tải thêm lịch sử cũ hơn'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;