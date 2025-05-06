import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getProductsByCategory, addCartItem } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy chi tiết sản phẩm
        const productRes = await getProductById(parseInt(id || '0'));
        setProduct(productRes.data);

        // Lấy sản phẩm liên quan (cùng danh mục)
        const categoryId = productRes.data.category._id;
        const relatedRes = await getProductsByCategory(categoryId);
        // Loại bỏ sản phẩm hiện tại khỏi danh sách liên quan
        const filteredProducts = relatedRes.data.filter((p: Product) => p._id !== parseInt(id || '0'));
        setRelatedProducts(filteredProducts);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        return;
      }
      if (!product) {
        alert('Sản phẩm không tồn tại!');
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

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (loading || !product) return <div className="text-center mt-5">Đang tải...</div>;

  const hasActiveDiscount = isDiscountActive(product.start_discount, product.end_discount);

  return (
    <div className="container mt-4 mb-5">
      {/* Chi tiết sản phẩm */}
      <div className="row bg-white p-4 rounded shadow-sm mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <img
            src={product.image || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="img-fluid rounded"
            style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
          />
        </div>
        <div className="col-md-6">
          <h1 className="mb-3" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            {product.name}
          </h1>
          <div className="mb-3">
            <span className="text-danger fs-3 me-2">
              {(hasActiveDiscount && product.discount_price
                ? product.discount_price
                : product.price
              ).toLocaleString('vi-VN')}{' '}
              VND
            </span>
            {hasActiveDiscount && product.discount_price && (
              <span className="text-muted text-decoration-line-through">
                {product.price.toLocaleString('vi-VN')} VND
              </span>
            )}
          </div>
          <p className="mb-2"><strong>Mô tả:</strong> {product.description}</p>
          <p className="mb-2"><strong>Chi tiết:</strong> {product.description_detail || 'Không có chi tiết'}</p>
          <p className="mb-2"><strong>Danh mục:</strong> {product.category.name}</p>
          <p className="mb-2"><strong>Đơn vị:</strong> {product.unit}</p>
          <p className="mb-2"><strong>Số lượng tồn:</strong> {product.quantity_in_stock}</p>
          <p className="mb-2"><strong>Trạng thái:</strong> {product.available ? 'Còn hàng' : 'Hết hàng'}</p>
          <p className="mb-2"><strong>Nhà cung cấp:</strong> {product.supplier.name}</p>
          <p className="mb-2"><strong>Địa chỉ:</strong> {product.supplier.address}</p>
          {(product.start_discount || product.end_discount) && (
            <>
              <p className="mb-2">
                <strong>Bắt đầu giảm giá:</strong> {formatDate(product.start_discount)}
              </p>
              <p className="mb-4">
                <strong>Kết thúc giảm giá:</strong> {formatDate(product.end_discount)}
              </p>
            </>
          )}
          <button
            onClick={handleAddToCart}
            className="btn text-white w-100"
            style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
            disabled={product.quantity_in_stock === 0}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Sản phẩm liên quan
          </h2>
          <div className="row">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct._id} className="col-md-3 col-sm-6 mb-4">
                <ProductCard product={relatedProduct} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

// CSS tùy chỉnh
const styles = `
  .btn:hover {
    background-color: #d43f21 !important;
    color: white !important;
  }
  .shadow-sm {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .rounded {
    border-radius: 8px;
  }
  h1, h2 {
    color: #333;
  }
  .text-danger {
    font-weight: bold;
  }
`;

// Thêm CSS vào trang
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);