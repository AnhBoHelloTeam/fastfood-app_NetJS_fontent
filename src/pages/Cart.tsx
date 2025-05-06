import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartItems, updateCartItem, removeCartItem, applyPromotion } from '../services/api';
import { CartItem as CartItemType, Promotion } from '../types';
import { jwtDecode } from 'jwt-decode';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [promotionCode, setPromotionCode] = useState<string>('');
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCartItems();
        setCartItems(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải giỏ hàng');
      }
    };
    fetchCartItems();
  }, []);

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    try {
      await updateCartItem(id, { quantity });
      const response = await getCartItems();
      setCartItems(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      await removeCartItem(id);
      const response = await getCartItems();
      setCartItems(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleApplyPromotion = async () => {
    try {
      const response = await applyPromotion(promotionCode);
      setPromotion(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
      setPromotion(null);
    }
  };

  // Kiểm tra giảm giá còn hiệu lực
  const isDiscountActive = (startDiscount?: string, endDiscount?: string): boolean => {
    if (!startDiscount || !endDiscount) return false;
    const currentDate = new Date();
    const start = new Date(startDiscount);
    const end = new Date(endDiscount);
    return currentDate >= start && currentDate <= end;
  };

  // Định dạng ngày
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Tính toán tổng giá
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = isDiscountActive(item.product.start_discount, item.product.end_discount) && item.product.discount_price
        ? item.product.discount_price
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  };

  const shippingFee = 10000; // Phí ship cố định

  const calculateTotal = () => {
    let total = calculateSubtotal();
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

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      navigate('/checkout', {
        state: {
          cartItems,
          subtotal: calculateSubtotal(),
          shippingFee,
          promotion,
          totalAmount: calculateTotal(),
          userId: decoded.userId || decoded._id || decoded.sub,
        },
      });
    } catch (err) {
      console.error('Lỗi giải mã token:', err);
      navigate('/login');
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4" style={{ fontSize: '2rem', fontWeight: 'bold' }}>Giỏ hàng</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {cartItems.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item._id} className="card mb-3 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <img
                  src={item.product.image || 'https://via.placeholder.com/150'}
                  alt={item.product.name}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '15px', borderRadius: '8px' }}
                />
                <div className="flex-grow-1">
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
                  <div className="d-flex align-items-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value))}
                      min="1"
                      className="form-control w-25 me-2"
                      style={{ maxWidth: '80px' }}
                    />
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <h3>Mã khuyến mãi</h3>
            <div className="input-group mb-3 w-50">
              <input
                type="text"
                value={promotionCode}
                onChange={(e) => setPromotionCode(e.target.value)}
                placeholder="Nhập mã khuyến mãi"
                className="form-control"
              />
              <button
                onClick={handleApplyPromotion}
                className="btn text-white"
                style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
              >
                Áp dụng
              </button>
            </div>
            {promotion && (
              <p>
                Giảm giá: {promotion.discountType === 'percentage'
                  ? `${promotion.discountValue}%`
                  : `${promotion.discountValue.toLocaleString('vi-VN')} VND`}
              </p>
            )}
            <div className="mt-4">
              <p><strong>Tổng giá sản phẩm:</strong> {calculateSubtotal().toLocaleString('vi-VN')} VND</p>
              <p><strong>Phí vận chuyển:</strong> {shippingFee.toLocaleString('vi-VN')} VND</p>
              {promotion && (
                <p>
                  <strong>Giảm giá khuyến mãi:</strong>{' '}
                  {promotion.discountType === 'percentage'
                    ? `${(Math.min(calculateSubtotal() * (promotion.discountValue / 100), promotion.max_discount_amount)).toLocaleString('vi-VN')} VND`
                    : `${(Math.min(promotion.discountValue, promotion.max_discount_amount)).toLocaleString('vi-VN')} VND`}
                </p>
              )}
              <h3><strong>Tổng cộng:</strong> {calculateTotal().toLocaleString('vi-VN')} VND</h3>
            </div>
            <button
              onClick={handleCheckout}
              className="btn text-white mt-3"
              style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
            >
              Đặt hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

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
`;

// Thêm CSS vào trang
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);