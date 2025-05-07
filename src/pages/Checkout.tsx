import { useState, useEffect, useRef } from 'react';
import { getProductById, getChatMessages, sendChatMessage, getCartItems } from '../services/api';
import { socket } from '../services/socket';
import { ChatMessage, Product } from '../types';

const Checkout = () => {
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Lấy userId và role từ token
  const token = localStorage.getItem('token');
  let userId: number | null = null;
  let role: string | null = null;

  useEffect(() => {
    const parseToken = () => {
      try {
        const userData = token ? JSON.parse(atob(token.split('.')[1])) : null;
        if (!userData) throw new Error('Token không hợp lệ');
        userId = userData.sub || userData._id;
        role = userData.role;
        setTokenError(null);
      } catch (err) {
        setTokenError('Vui lòng đăng nhập lại');
      }
    };
    parseToken();
  }, [token]);

  useEffect(() => {
    if (tokenError || !userId || !role) return;

    socket.connect();

    const fetchReceiverId = async () => {
      if (retryCountRef.current < maxRetries) {
        try {
          // Lấy giỏ hàng để lấy productId
          const cartRes = await getCartItems();
          const cartItems = cartRes.data;
          if (cartItems.length === 0) {
            setError('Giỏ hàng trống. Vui lòng thêm sản phẩm.');
            return;
          }
          const productId = cartItems[0].productId; // Lấy sản phẩm đầu tiên
          const productRes = await getProductById(productId);
          const product: Product = productRes.data;
          if (product.createdBy && product.createdBy.role === 'admin') {
            setReceiverId(product.createdBy._id);
            retryCountRef.current = 0;
          } else {
            retryCountRef.current += 1;
            setTimeout(fetchReceiverId, 2000);
          }
        } catch (err: any) {
          retryCountRef.current += 1;
          setTimeout(fetchReceiverId, 2000);
        }
      } else {
        setError('Không tìm thấy admin tạo sản phẩm. Vui lòng thử lại sau.');
      }
    };

    const fetchMessages = async () => {
      setLoading(true);
      try {
        if (receiverId) {
          const res = await getChatMessages(receiverId);
          setChatMessages(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải tin nhắn');
      } finally {
        setLoading(false);
      }
    };

    if (role === 'user') {
      fetchReceiverId();
    }
    if (receiverId) {
      fetchMessages();
    }

    socket.on('message', (msg: ChatMessage) => {
      if (
        (msg.sender._id === userId && msg.receiver._id === receiverId) ||
        (msg.sender._id === receiverId && msg.receiver._id === userId)
      ) {
        setChatMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [receiverId, userId, role, tokenError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !receiverId) {
      setError('Tin nhắn không được để trống hoặc chưa xác định người nhận');
      return;
    }
    try {
      await sendChatMessage({ receiverId, content: newMessage });
      const response = await getChatMessages(receiverId);
      setChatMessages(response.data);
      setNewMessage('');
      setError('');
      socket.emit('message', response.data[response.data.length - 1]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi tin nhắn');
    }
  };

  if (tokenError) {
    return <div className="container mt-4 alert alert-danger">{tokenError}</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Thanh toán</h1>
      {/* Các thành phần thanh toán khác */}
      <div className="card h-[60vh]">
        <div className="card-body overflow-y-auto p-4">
          {error && <div className="alert alert-danger mb-4">{error}</div>}
          {loading ? (
            <p className="text-center">Đang tải tin nhắn...</p>
          ) : chatMessages.length === 0 ? (
            <p className="text-center">Chưa có tin nhắn</p>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg._id}
                className={`mb-4 ${msg.sender._id === userId ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block max-w-xs p-3 rounded ${
                    msg.sender._id === userId ? 'bg-primary text-white' : 'bg-secondary text-black'
                  }`}
                >
                  <p className="font-weight-bold">{msg.sender.name || `User ${msg.sender._id}`}</p>
                  <p>{msg.content}</p>
                  <p className="font-size-sm mt-1 opacity-75">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="card-footer p-4">
          <div className="input-group">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn cho admin tạo sản phẩm"
              className="form-control mr-2 rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="btn btn-primary text-white px-4 py-2 rounded"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;