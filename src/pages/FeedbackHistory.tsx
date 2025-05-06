import React, { useEffect, useState } from 'react';
import { getOrders, getFeedbacks, getCurrentUser } from '../services/api';
import { Order, Feedback, User } from '../types';
import { FaStar } from 'react-icons/fa';

const FeedbackHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching token:', localStorage.getItem('token')); // Log token
        const userRes = await getCurrentUser().catch((err) => {
          console.error('getCurrentUser error:', err.response?.data || err.message);
          throw err;
        });
        console.log('getCurrentUser response:', userRes.data);
        const ordersRes = await getOrders().catch((err) => {
          console.error('getOrders error:', err.response?.data || err.message);
          throw err;
        });
        console.log('getOrders response:', ordersRes.data);
        const feedbacksRes = await getFeedbacks().catch((err) => {
          console.error('getFeedbacks error:', err.response?.data || err.message);
          throw err;
        });
        console.log('getFeedbacks response:', feedbacksRes.data);
        setUser(userRes.data);
        setOrders(ordersRes.data);
        setFeedbacks(feedbacksRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu');
        console.error('fetchData error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (loading) {
    return <div className="text-center mt-5">Đang tải...</div>;
  }

  if (!user) {
    return <div className="alert alert-warning">Vui lòng đăng nhập để xem lịch sử đánh giá.</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4 text-center" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        Lịch sử đánh giá
      </h1>

      {orders.length === 0 ? (
        <p className="text-center">Không có đơn hàng nào.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Mã đơn hàng</th>
                <th className="border p-3 text-left">Người đặt</th>
                <th className="border p-3 text-left">Sản phẩm</th>
                <th className="border p-3 text-left">Tổng tiền</th>
                <th className="border p-3 text-left">Trạng thái</th>
                <th className="border p-3 text-left">Ngày đặt</th>
                <th className="border p-3 text-left">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="border p-3">{order._id}</td>
                  <td className="border p-3">
                    {user.role === 'admin' ? (
                      <span>
                        {order.user.name} ({order.user.email})
                      </span>
                    ) : (
                      order.user.name
                    )}
                  </td>
                  <td className="border p-3">
                    {order.orderItems.map((item) => (
                      <div key={item._id} className="mb-1 text-sm">
                        {item.product.name} (x{item.quantity})
                      </div>
                    ))}
                  </td>
                  <td className="border p-3">{order.totalAmount} VND</td>
                  <td className="border p-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold border
                        ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-400'
                            : order.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 border-green-400'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800 border-blue-400'
                            : order.status === 'delivered'
                            ? 'bg-teal-100 text-teal-800 border-teal-400'
                            : 'bg-red-100 text-red-800 border-red-400'
                        }`}
                    >
                      {order.status === 'pending'
                        ? 'Chờ xác nhận'
                        : order.status === 'confirmed'
                        ? 'Đã xác nhận'
                        : order.status === 'shipped'
                        ? 'Đang giao'
                        : order.status === 'delivered'
                        ? 'Đã giao'
                        : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="border p-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border p-3">
                    {order.orderItems.map((item) => {
                      const feedback = feedbacks.find(
                        (f) =>
                          f.product._id === item.product._id &&
                          (user.role === 'admin' || f.user._id === user._id)
                      );
                      return (
                        <div key={item._id} className="mb-2">
                          <div className="font-semibold">{item.product.name}</div>
                          {feedback ? (
                            <div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, index) => (
                                  <FaStar
                                    key={index}
                                    className={`text-sm ${
                                      index < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm">{feedback.comment}</p>
                              {user.role === 'admin' && (
                                <p className="text-xs text-gray-500">
                                  Đánh giá bởi: {feedback.user.name} ({feedback.user.email})
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Chưa có đánh giá</p>
                          )}
                        </div>
                      );
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackHistory;