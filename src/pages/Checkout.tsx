import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder, applyPromotion, getSupplier, getChatMessages, sendChatMessage, getPaymentMethods, getPromotions, clearCartItems } from '../services/api';
import { CartItem as CartItemType, Promotion, Supplier, PaymentMethod } from '../types';
import PromotionDetailModal from '../components/PromotionDetailModal';

interface ChatMessage {
  _id: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
}

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems, subtotal, shippingFee, promotion: initialPromotion, userId } = state || {};
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [promotionCode, setPromotionCode] = useState<string>('');
  const [promotion, setPromotion] = useState<Promotion | null>(initialPromotion || null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [adminId, setAdminId] = useState<number | null>(null);
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [showPromotionDropdown, setShowPromotionDropdown] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const validPaymentMethods = ['cash', 'card', 'bank_transfer'];

  const isDiscountActive = (startDiscount?: string, endDiscount?: string): boolean => {
    if (!startDiscount || !endDiscount) return false;
    const currentDate = new Date();
    const start = new Date(startDiscount);
    const end = new Date(endDiscount);
    return currentDate >= start && currentDate <= end;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  useEffect(() => {
    if (!userId || !cartItems) {
      setError('Dữ liệu không hợp lệ. Vui lòng quay lại giỏ hàng.');
      navigate('/cart');
      return;
    }
    const fetchPaymentMethods = async () => {
      try {
        const response = await getPaymentMethods();
        const methods = response.data.map((method: PaymentMethod) => {
          let value = method.value.toLowerCase();
          if (!validPaymentMethods.includes(value)) {
            if (value.includes('cash') || value.includes('cod')) value = 'cash';
            else if (value.includes('card') || value.includes('credit')) value = 'card';
            else if (value.includes('bank') || value.includes('transfer')) value = 'bank_transfer';
            else value = 'cash';
          }
          return { ...method, value };
        });
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setPaymentMethod(methods[0].value);
        }
      } catch (err: any) {
        setError('Không thể tải phương thức thanh toán. Mặc định: Tiền mặt');
        setPaymentMethods([
          { id: 1, name: 'Tiền mặt', value: 'cash' },
          { id: 2, name: 'Thẻ tín dụng', value: 'card' },
          { id: 3, name: 'Chuyển khoản ngân hàng', value: 'bank_transfer' },
        ]);
        setPaymentMethod('cash');
      }
    };
    const fetchSuppliers = async () => {
      try {
        const supplierIds: number[] = [];
        cartItems.forEach((item: CartItemType) => {
          if (item.product.supplier?._id && !supplierIds.includes(item.product.supplier._id)) {
            supplierIds.push(item.product.supplier._id);
          }
        });
        const supplierPromises = supplierIds.map((id) => getSupplier(id));
        const supplierResponses = await Promise.all(supplierPromises);
        setSuppliers(supplierResponses.map((res) => res.data));
      } catch (err: any) {
        setError('Không thể tải thông tin nhà cung cấp');
      }
    };
    const fetchAdminChat = async () => {
      try {
        const response = await getChatMessages(1);
        setChatMessages(response.data);
        setAdminId(1);
      } catch (err: any) {
        setError('Không thể tải tin nhắn');
      }
    };
    const fetchPromotions = async () => {
      try {
        const response = await getPromotions();
        const currentDate = new Date();
        const filteredPromotions = response.data.filter((promo: Promotion) => {
          const validFrom = new Date(promo.validFrom);
          const validTo = new Date(promo.validTo);
          return (
            promo.isActive &&
            currentDate >= validFrom &&
            currentDate <= validTo &&
            subtotal >= promo.min_order_value
          );
        });
        setAvailablePromotions(filteredPromotions);
      } catch (err: any) {
        setError('Không thể tải danh sách mã giảm giá');
      }
    };
    fetchPaymentMethods();
    fetchSuppliers();
    fetchAdminChat();
    fetchPromotions();
  }, [cartItems, userId, navigate, subtotal]);

  const handleApplyPromotion = async (code: string) => {
    try {
      if (!code.trim()) {
        setError('Vui lòng nhập mã giảm giá');
        return;
      }
      const res = await applyPromotion(code);
      setPromotion(res.data);
      setPromotionCode(code);
      setError('');
      setShowPromotionDropdown(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Mã khuyến mãi "${code}" không hợp lệ hoặc không tồn tại`;
      setError(errorMessage);
      setPromotion(null);
    }
  };

  const handlePromotionInputChange = (value: string) => {
    setPromotionCode(value);
    setShowPromotionDropdown(value.length > 0);
  };

  const handleSelectPromotion = (promo: Promotion | null) => {
    if (!promo) {
      setPromotionCode('');
      setPromotion(null);
      setError('');
    } else {
      setPromotionCode(promo.code);
      handleApplyPromotion(promo.code);
    }
    setShowPromotionDropdown(false);
  };

  const handleShowDetail = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setShowDetailModal(true);
  };

  const calculateTotal = () => {
    let total = subtotal;
    if (promotion) {
      if (promotion.discountType === 'percentage') {
        const discount = Math.min(total * (promotion.discountValue / 100), promotion.max_discount_amount);
        total -= discount;
      } else {
        total -= Math.min(promotion.discountValue, promotion.max_discount_amount);
      }
    }
    return total + shippingFee;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !adminId) return;
    try {
      await sendChatMessage({ receiverId: adminId, message: newMessage });
      const response = await getChatMessages(adminId);
      setChatMessages(response.data);
      setNewMessage('');
    } catch (err: any) {
      setError('Không thể gửi tin nhắn');
    }
  };

  const handleConfirmOrder = async () => {
    try {
      if (!validPaymentMethods.includes(paymentMethod)) {
        setError('Phương thức thanh toán không hợp lệ. Vui lòng chọn lại.');
        return;
      }
      const orderData: any = {
        userId,
        totalAmount: calculateTotal(),
        status: 'pending',
        shipping_address: '123 Đường Láng, Hà Nội',
        shipping_fee: shippingFee,
        paymentMethod,
        payment_status: 'unpaid',
        orderItems: cartItems.map((item: CartItemType) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        ...(promotion?.code && { promotion_code: promotion.code }),
      };
      console.log('orderData:', orderData);
      const response = await createOrder(orderData);
      // Reset giỏ hàng
      try {
        await clearCartItems();
        console.log('Giỏ hàng đã được reset');
      } catch (err: any) {
        console.error('Lỗi khi reset giỏ hàng:', err.response?.data);
      }
      localStorage.removeItem('cart');
      alert('Đặt hàng thành công!');
      navigate(`/orders/${response.data._id}`);
    } catch (err: any) {
      console.error('Lỗi đặt hàng:', err.response?.data);
      setError(err.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4" style={{ fontSize: '2rem', fontWeight: 'bold' }}>Thanh toán</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {!cartItems ? (
        <p>Dữ liệu không hợp lệ. Vui lòng quay lại giỏ hàng.</p>
      ) : (
        <div className="row">
          <div className="col-md-8">
            <h3>Sản phẩm</h3>
            {cartItems.map((item: CartItemType) => (
              <div key={item._id} className="card mb-3 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <img
                    src={item.product.image || 'https://via.placeholder.com/150'}
                    alt={item.product.name}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '15px', borderRadius: '8px' }}
                  />
                  <div>
                    <h5 className="mb-2">{item.product.name}</h5>
                    <div className="mb-2">
                      <span className="text-danger fs-5">
                        {(isDiscountActive(item.product.start_discount, item.product.end_discount) && item.product.discount_price
                          ? item.product.discount_price
                          : item.product.price
                        ).toLocaleString('vi-VN')}{' '}
                        VND
                      </span>
                      {isDiscountActive(item.product.start_discount, item.product.end_discount) && item.product.discount_price && (
                        <span className="text-muted text-decoration-line-through ms-2">
                          {item.product.price.toLocaleString('vi-VN')} VND
                        </span>
                      )}
                    </div>
                    {(item.product.start_discount || item.product.end_discount) && (
                      <p className="text-muted small mb-2">
                        Giảm giá: {formatDate(item.product.start_discount)} - {formatDate(item.product.end_discount)}
                      </p>
                    )}
                    <p>Số lượng: {item.quantity}</p>
                    <p>
                      <strong>Tổng:</strong>{' '}
                      {((isDiscountActive(item.product.start_discount, item.product.end_discount) && item.product.discount_price
                        ? item.product.discount_price
                        : item.product.price
                      ) * item.quantity).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <h3>Phương thức thanh toán</h3>
            <select
              className="form-control mb-3"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.value}>
                  {method.name}
                </option>
              ))}
            </select>
            <h3>Mã giảm giá</h3>
            <div className="input-group mb-3 w-50 position-relative">
              <input
                type="text"
                value={promotionCode}
                onChange={(e) => handlePromotionInputChange(e.target.value)}
                placeholder="Nhập mã khuyến mãi"
                className="form-control"
                onFocus={() => setShowPromotionDropdown(true)}
              />
              <button
                onClick={() => handleApplyPromotion(promotionCode)}
                className="btn text-white"
                style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
              >
                Áp dụng
              </button>
              {showPromotionDropdown && (
                <div
                  className="dropdown-menu show w-100"
                  style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    position: 'absolute',
                    top: '100%',
                    zIndex: 1000,
                  }}
                >
                  <div
                    className="dropdown-item d-flex justify-content-between align-items-center"
                  >
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectPromotion(null)}
                    >
                      Không áp dụng mã
                    </span>
                  </div>
                  {availablePromotions.map((promo) => (
                    <div
                      key={promo._id}
                      className="dropdown-item d-flex justify-content-between align-items-center"
                    >
                      <span
                        style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                        onClick={() => handleSelectPromotion(promo)}
                      >
                        {promo.code} (
                        {promo.discountType === 'percentage'
                          ? `${promo.discountValue}%`
                          : `${promo.discountValue.toLocaleString('vi-VN')} VND`}
                        , tối đa {promo.max_discount_amount.toLocaleString('vi-VN')} VNĐ
                        , tối thiểu {promo.min_order_value.toLocaleString('vi-VN')} VNĐ)
                      </span>
                      <button
                        className="btn btn-link btn-sm"
                        onClick={() => handleShowDetail(promo)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {promotion && (
              <p>
                Giảm giá: {promotion.discountType === 'percentage'
                  ? `${promotion.discountValue}%`
                  : `${promotion.discountValue.toLocaleString('vi-VN')} VND`}
              </p>
            )}
            <div className="mt-4">
              <p><strong>Tổng giá sản phẩm:</strong> {subtotal.toLocaleString('vi-VN')} VND</p>
              <p><strong>Phí vận chuyển:</strong> {shippingFee.toLocaleString('vi-VN')} VND</p>
              {promotion && (
                <p>
                  <strong>Giảm giá khuyến mãi:</strong>{' '}
                  {promotion.discountType === 'percentage'
                    ? `${(Math.min(subtotal * (promotion.discountValue / 100), promotion.max_discount_amount)).toLocaleString('vi-VN')} VND`
                    : `${(Math.min(promotion.discountValue, promotion.max_discount_amount)).toLocaleString('vi-VN')} VND`}
                </p>
              )}
              <h3><strong>Tổng cộng:</strong> {calculateTotal().toLocaleString('vi-VN')} VND</h3>
            </div>
            <button
              onClick={handleConfirmOrder}
              className="btn text-white mt-3"
              style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
            >
              Xác nhận đặt hàng
            </button>
          </div>
          <div className="col-md-4">
            <h3>Thông tin nhà cung cấp</h3>
            {suppliers.map((supplier) => (
              <div key={supplier._id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <h5>{supplier.name}</h5>
                  <p>Email: {supplier.email}</p>
                  <p>Điện thoại: {supplier.phone}</p>
                  <p>Địa chỉ: {supplier.address}</p>
                </div>
              </div>
            ))}
            <h3>Chat với Admin</h3>
            <div className="card shadow-sm">
              <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {chatMessages.map((msg) => (
                  <div key={msg._id} className={msg.senderId === userId ? 'text-right' : ''}>
                    <p><strong>{msg.senderId === userId ? 'Bạn' : 'Admin'}:</strong> {msg.message}</p>
                    <small>{new Date(msg.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
              <div className="card-footer">
                <div className="input-group">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn"
                    className="form-control"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="btn text-white"
                    style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
          <PromotionDetailModal
            show={showDetailModal}
            onHide={() => setShowDetailModal(false)}
            promotion={selectedPromotion}
          />
        </div>
      )}
    </div>
  );
};

export default Checkout;

// CSS tùy chỉnh
const styles = `
  .btn:hover {
    background-color: #d43f21 !important;
    color: white !important;
  }
  .shadow-sm {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .text-danger {
    font-weight: bold;
  }
  .dropdown-menu {
    width: 100%;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  .dropdown-item {
    padding: 8px 12px;
    white-space: normal;
  }
  .dropdown-item:hover {
    background-color: #f8f9fa;
  }
  .dropdown-item span {
    display: inline-block;
    max-width: 70%;
  }
  .dropdown-item button {
    padding: 0;
    font-size: 0.85rem;
  }
`;

// Thêm CSS vào trang
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);