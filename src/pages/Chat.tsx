import { useState } from 'react';
import ChatBox from '../components/ChatBox';

const Chat = () => {
  const [receiverId, setReceiverId] = useState('');
  const userId = 1; // Giả sử userId lấy từ token, thay bằng logic thực tế

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Chat</h1>
      <div className="mb-3">
        <label className="form-label">ID người nhận</label>
        <input
          type="number"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="form-control w-25"
          placeholder="Nhập ID người nhận"
        />
      </div>
      {receiverId && <ChatBox receiverId={parseInt(receiverId)} userId={userId} />}
    </div>
  );
};

export default Chat;