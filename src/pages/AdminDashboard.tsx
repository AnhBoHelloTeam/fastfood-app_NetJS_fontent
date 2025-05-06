import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
  _id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { _id: number; name: string };
}

interface Notification {
  _id: number;
  message: string;
  status: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterConfirmed, setFilterConfirmed] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Lấy danh sách đơn hàng
        const ordersResponse = await axios.get('http://localhost:3000/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersResponse.data);
        // Lấy danh sách thông báo
        const notificationsResponse = await axios.get('http://localhost:3000/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(notificationsResponse.data);
      } catch (err) {
        setError('Không thể tải dữ liệu');
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const confirmOrder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/orders/${orderId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Cập nhật lại danh sách đơn hàng
      const ordersResponse = await axios.get('http://localhost:3000/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(ordersResponse.data);
      // Cập nhật lại thông báo
      const notificationsResponse = await axios.get('http://localhost:3000/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notificationsResponse.data);
    } catch (err) {
      setError('Không thể xác nhận đơn hàng');
      console.error(err);
    }
  };

  const filteredOrders = filterConfirmed ? orders.filter(order => order.status === 'confirmed' || order.status === 'shipped') : orders;

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bảng điều khiển Admin</h1>
      <div className="mb-4">
        <label>
          <input
            type="checkbox"
            checked={filterConfirmed}
            onChange={() => setFilterConfirmed(!filterConfirmed)}
          />
          Chỉ hiển thị đơn hàng đã xác nhận
        </label>
      </div>
      <h2 className="text-xl font-semibold mb-2">Thông báo</h2>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        {notifications.length === 0 ? (
          <p>Không có thông báo.</p>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification._id} className="border-b py-2">
                <p>{notification.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <h2 className="text-xl font-semibold mb-2">Danh sách đơn hàng</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {filteredOrders.length === 0 ? (
          <p>Không có đơn hàng nào.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Mã đơn hàng</th>
                <th className="border p-2">Người đặt</th>
                <th className="border p-2">Tổng tiền</th>
                <th className="border p-2">Trạng thái</th>
                <th className="border p-2">Ngày đặt</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-100">
                  <td className="border p-2">{order._id}</td>
                  <td className="border p-2">{order.user.name}</td>
                  <td className="border p-2">{order.totalAmount} VND</td>
                  <td className="border p-2">
                    {order.status === 'pending' ? 'Chờ xác nhận' : 
                     order.status === 'confirmed' ? 'Đã xác nhận' : 
                     order.status === 'shipped' ? 'Đang giao' : 
                     order.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                  </td>
                  <td className="border p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="border p-2">
                    {order.status === 'pending' && (
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        onClick={() => confirmOrder(order._id)}
                      >
                        Xác nhận
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;