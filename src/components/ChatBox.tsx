import { useState, useEffect } from 'react';
import { getChatMessages, sendChatMessage } from '../services/api';
import { socket } from '../services/socket';
import { ChatMessage } from '../types';

interface ChatBoxProps {
  receiverId: number;
  userId: number;
}

const ChatBox = ({ receiverId, userId }: ChatBoxProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    socket.connect();

    const fetchMessages = async () => {
      try {
        const res = await getChatMessages(receiverId);
        setMessages(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải tin nhắn');
      }
    };
    fetchMessages();

    socket.on('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [receiverId]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Tin nhắn không được để trống');
      return;
    }
    try {
      const res = await sendChatMessage({ receiverId, message });
      socket.emit('message', res.data);
      setMessage('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi tin nhắn');
    }
  };

  return (
    <div className="chat-box card mb-3">
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2">
            <p>
              <strong>User {msg.senderId}:</strong> {msg.message}
            </p>
          </div>
        ))}
      </div>
      <div className="input-group">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn"
          className="form-control"
        />
        <button onClick={handleSendMessage} className="btn btn-shopeefood text-white">
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;