import { useState, useEffect, useRef } from 'react';
import { getChatMessages, sendChatMessage, getUsers } from '../services/api';
import { socket } from '../services/socket';
import { ChatMessage, User } from '../types';

interface ChatBoxProps {
  receiverId: number;
  userId: number;
  role: string;
}

const ChatBox = ({ receiverId, userId, role }: ChatBoxProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    socket.connect();

    const fetchAdminId = async () => {
      if (role === 'user' && retryCountRef.current < maxRetries) {
        try {
          const res = await getUsers();
          const admin = res.data.find((u: User) => u.role === 'admin');
          if (admin) {
            setAdminId(admin._id);
            retryCountRef.current = 0;
          } else {
            retryCountRef.current += 1;
            setTimeout(fetchAdminId, 2000);
          }
        } catch (err: any) {
          retryCountRef.current += 1;
          setTimeout(fetchAdminId, 2000);
        }
      } else if (retryCountRef.current >= maxRetries) {
        setError('Không tìm thấy admin. Vui lòng thử lại sau');
      }
    };

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const actualReceiverId = role === 'user' ? adminId : receiverId;
        if (actualReceiverId) {
          const res = await getChatMessages(actualReceiverId);
          setMessages(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải tin nhắn');
      } finally {
        setLoading(false);
      }
    };

    if (role === 'user') {
      fetchAdminId();
    }
    if (role === 'admin' || adminId) {
      fetchMessages();
    }

    socket.on('message', (msg: ChatMessage) => {
      if (
        (msg.sender._id === userId && msg.receiver._id === (role === 'user' ? adminId : receiverId)) ||
        (msg.sender._id === (role === 'user' ? adminId : receiverId) && msg.receiver._id === userId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [receiverId, userId, role, adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Tin nhắn không được để trống');
      return;
    }
    try {
      const actualReceiverId = role === 'user' ? adminId : receiverId;
      if (!actualReceiverId) {
        setError('Không thể xác định người nhận');
        return;
      }
      const res = await sendChatMessage({ receiverId: actualReceiverId, content: message });
      socket.emit('message', res.data);
      setMessage('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi tin nhắn');
    }
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="card-body flex-1 overflow-y-auto p-4">
        {error && <div className="alert alert-danger mb-4">{error}</div>}
        {loading ? (
          <p className="text-gray-500 text-center">Đang tải tin nhắn...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có tin nhắn</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-4 flex ${msg.sender._id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.sender._id === userId ? 'bg-shopeefood text-white' : 'bg-gray-200 text-black'
                }`}
              >
                <p className="font-medium">{msg.sender.name || `User ${msg.sender._id}`}</p>
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="card-footer p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn"
            className="form-control flex-1 mr-2 rounded-md border-gray-300"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="btn bg-shopeefood text-white px-4 py-2 rounded-md"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;