import { useState, useEffect } from 'react';
import ChatBox from '../components/ChatBox';
import { getUsers } from '../services/api';
import { User } from '../types';

const Chat = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Lấy userId và role từ token
  const token = localStorage.getItem('token');
  let userId: number, role: string;
  try {
    const userData = token ? JSON.parse(atob(token.split('.')[1])) : null;
    if (!userData) throw new Error('Token không hợp lệ');
    userId = userData.sub || userData._id;
    role = userData.role;
  } catch (err) {
    return <div className="container mt-4 alert alert-danger">Vui lòng đăng nhập lại</div>;
  }

  useEffect(() => {
    if (role === 'admin') {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const res = await getUsers();
          const userList = res.data.filter((u: User) => u.role === 'user');
          if (userList.length === 0) {
            setError('Không có người dùng nào để chat');
          } else {
            setUsers(userList);
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [role]);

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4 h-[80vh] flex flex-col">
      <h1 className="mb-4 text-2xl font-bold">Chat</h1>
      <div className="flex flex-1 overflow-hidden">
        {role === 'admin' && (
          <div className="w-1/4 border-r border-gray-200 pr-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Người dùng</h2>
            {loading ? (
              <p>Đang tải...</p>
            ) : users.length === 0 ? (
              <p>Không có người dùng nào</p>
            ) : (
              <ul className="space-y-2">
                {users.map((user) => (
                  <li
                    key={user._id}
                    className={`p-2 cursor-pointer rounded flex items-center space-x-2 ${
                      selectedUserId === user._id ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedUserId(user._id)}
                  >
                    <img
                      src={user.avatar || 'https://via.placeholder.com/40'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex-1 pl-4">
          {role === 'admin' && !selectedUserId ? (
            <p className="text-gray-500">Chọn một người dùng để bắt đầu chat</p>
          ) : (
            <ChatBox
              receiverId={role === 'admin' ? selectedUserId! : 0}
              userId={userId}
              role={role}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;