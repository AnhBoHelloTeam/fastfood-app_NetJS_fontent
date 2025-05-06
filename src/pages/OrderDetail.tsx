import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Order {
  _id: number;
  totalAmount: number;
  status: string;
  shipping_address: string;
  shipping_fee: number;
  paymentMethod: string;
  payment_status: string;
  createdAt: string;
  user: { _id: number; name: string };
  orderItems: { _id: number; product: { _id: number; name: string; image: string }; quantity: number; price: number }[];
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (err) {
        setError('Không thể tải chi tiết đơn hàng');
        console.error(err);
      }
    };
    fetchOrder();
  }, [id]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!order) {
    return <div className="text-center mt-5">Đang tải...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4 text-center" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        Chi tiết đơn hàng #{order._id}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="mb-2"><strong>Người đặt:</strong> {order.user.name}</p>
            <p className="mb-2"><strong>Tổng tiền:</strong> {order.totalAmount} VND</p>
            <p className="mb-2">
              <strong>Trạng thái:</strong>{' '}
              <span className={`inline-block px-2 py-1 rounded text-green-700 bg-opacity-20 ${
                order.status === 'pending' ? 'bg-yellow-500' : 
                order.status === 'confirmed' ? 'bg-green-500' : 
                order.status === 'shipped' ? 'bg-blue-500' : 
                order.status === 'delivered' ? 'bg-teal-500' : 'bg-red-500'
              }`}>
                {order.status === 'pending' ? 'Chờ xác nhận' : 
                 order.status === 'confirmed' ? 'Đã xác nhận' : 
                 order.status === 'shipped' ? 'Đang giao' : 
                 order.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
              </span>
            </p>
            <p className="mb-2"><strong>Địa chỉ giao hàng:</strong> {order.shipping_address}</p>
          </div>
          <div>
            <p className="mb-2"><strong>Phí giao hàng:</strong> {order.shipping_fee} VND</p>
            <p className="mb-2">
              <strong>Phương thức thanh toán:</strong>{' '}
              {order.paymentMethod === 'cash' ? 'Tiền mặt' : 
               order.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}
            </p>
            <p className="mb-2">
              <strong>Trạng thái thanh toán:</strong>{' '}
              {order.payment_status === 'unpaid' ? 'Chưa thanh toán' : 
               order.payment_status === 'paid' ? 'Đã thanh toán' : 'Thất bại'}
            </p>
            <p className="mb-2"><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
        <ul className="space-y-4">
          {order.orderItems.map((item) => (
            <li key={item._id} className="flex items-center space-x-4 border-b pb-4">
              {item.product.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No image</span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                <p className="text-sm text-gray-600">Giá: {item.price} VND</p>
              </div>
            </li>
          ))}
        </ul>
        <button
          className="mt-6 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          onClick={() => navigate('/orders')}
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;