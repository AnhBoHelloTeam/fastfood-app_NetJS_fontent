import { Link } from 'react-router-dom';
import { Product } from '../types';
import { addCartItem } from '../services/api';
import { FaStar } from 'react-icons/fa';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        return;
      }
      await addCartItem({ productId: product._id, quantity: 1 });
      alert('Đã thêm vào giỏ hàng!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
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

  const hasActiveDiscount = isDiscountActive(product.start_discount, product.end_discount);
  const rating = product.averageRating || 0;
  const totalFeedbacks = product.totalFeedbacks || 0;

  return (
    <div className="card h-100 shadow-sm">
      <Link to={`/products/${product._id}`}>
        <img
          src={product.image || 'https://via.placeholder.com/200'}
          alt={product.name}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
        />
      </Link>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">
          <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
            {product.name}
          </Link>
        </h5>
        <p className="card-text text-muted small mb-2" style={{ flexGrow: 1 }}>
          {product.description}
        </p>
        <div className="mb-2">
          <span className="text-danger fs-5">
            {(hasActiveDiscount && product.discount_price
              ? product.discount_price
              : product.price
            ).toLocaleString('vi-VN')}{' '}
            VND
          </span>
          {hasActiveDiscount && product.discount_price && (
            <span className="text-muted text-decoration-line-through ms-2">
              {product.price.toLocaleString('vi-VN')} VND
            </span>
          )}
        </div>
        {/* <div className="mb-2 d-flex align-items-center">
          {[...Array(5)].map((_, index) => (
            // @ts-ignore
            <FaStar
              key={index}
              className={`text-sm ${index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-muted small ms-2">({totalFeedbacks} đánh giá)</span>
        </div> */}
        {(product.start_discount || product.end_discount) && (
          <p className="card-text text-muted small mb-2">
            Giảm giá: {formatDate(product.start_discount)} - {formatDate(product.end_discount)}
          </p>
        )}
        <p className="card-text text-muted small">Còn: {product.quantity_in_stock}</p>
        <button
          onClick={handleAddToCart}
          className="btn text-white w-100 mt-auto"
          style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
          disabled={product.quantity_in_stock === 0}
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

// CSS tùy chỉnh
const styles = `
  .card {
    transition: transform 0.2s;
  }
  .card:hover {
    transform: translateY(-5px);
  }
  .card-img-top {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  .text-danger {
    font-weight: bold;
  }
  .btn:hover {
    background-color: #d43f21 !important;
  }
`;

// Thêm CSS vào trang
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);