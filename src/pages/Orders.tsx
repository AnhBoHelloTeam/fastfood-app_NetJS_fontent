import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

interface Order {
  _id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { _id: number; name: string };
  orderItems: {
    _id: number;
    product: { _id: number; name: string; image: string };
  }[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [feedbackProductId, setFeedbackProductId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng');
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  const handleConfirmDelivery = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/orders/${orderId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Cập nhật trạng thái trong UI
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: 'delivered' } : order
        )
      );
      // Mở modal đánh giá
      const order = orders.find((o) => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
        setFeedbackProductId(order.orderItems[0].product._id);
        setShowFeedbackModal(true);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Không thể xác nhận nhận hàng'
      );
      console.error('Error details:', err.response?.data);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedOrder || !feedbackProductId || rating === 0) {
      setError('Vui lòng chọn số sao và viết đánh giá');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/feedbacks',
        {
          productId: feedbackProductId,
          rating,
          comment,
          userId: selectedOrder.user._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowFeedbackModal(false);
      setRating(0);
      setComment('');
      setSelectedOrder(null);
      setFeedbackProductId(null);
    } catch (err) {
      setError('Không thể gửi đánh giá');
      console.error(err);
    }
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4 text-center" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        Danh sách đơn hàng
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
                <th className="border p-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="border p-3">{order._id}</td>
                  <td className="border p-3">{order.user.name}</td>
                  <td className="border p-3">
                    {order.orderItems.map((item) => (
                      <div key={item._id} className="mb-1 text-sm">
                        {item.product.name}
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
                  <td className="border p-3 space-x-2">
                    <button
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      Xem chi tiết
                    </button>
                    {order.status === 'shipped' && (
                      <button
                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                        onClick={() => handleConfirmDelivery(order._id)}
                      >
                        Đã nhận hàng
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal đánh giá */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Đánh giá sản phẩm</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Đánh giá (1-5 sao):</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  // @ts-ignore
                  <FaStar
                    key={star}
                    className={`cursor-pointer text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Bình luận:</label>
              <textarea
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Viết đánh giá của bạn..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                onClick={() => setShowFeedbackModal(false)}
              >
                Hủy
              </button>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                onClick={handleSubmitFeedback}
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;