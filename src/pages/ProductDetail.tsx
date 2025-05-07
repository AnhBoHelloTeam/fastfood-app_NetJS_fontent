import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProductsByCategory, addCartItem } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!id || isNaN(parseInt(id))) {
          throw new Error('ID sản phẩm không hợp lệ');
        }
        const productId = parseInt(id);
        console.log(`Fetching product with ID: ${productId}`);
        // Lấy chi tiết sản phẩm
        const productRes = await getProductById(productId);
        console.log('Product response:', productRes.data);
        setProduct(productRes.data);

        // Kiểm tra category trước khi lấy sản phẩm liên quan
        if (productRes.data.category?._id) {
          const categoryId = productRes.data.category._id;
          console.log(`Fetching related products for category ID: ${categoryId}`);
          const relatedRes = await getProductsByCategory(categoryId);
          console.log('Related products response:', relatedRes.data);
          // Loại bỏ sản phẩm hiện tại khỏi danh sách liên quan
          const filteredProducts = relatedRes.data.filter((p: Product) => p._id !== productId);
          setRelatedProducts(filteredProducts);
        } else {
          console.log('No valid category found for product, skipping related products');
          setRelatedProducts([]);
        }
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu sản phẩm:', err);
        const errorMessage = err.response?.data?.message || 'Sản phẩm không tồn tại hoặc không thể tải dữ liệu';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        navigate('/login');
        return;
      }
      if (!product) {
        alert('Sản phẩm không tồn tại!');
        return;
      }
      console.log(`Adding to cart: product ID ${product._id}, quantity 1`);
      await addCartItem({ productId: product._id, quantity: 1 });
      alert('Đã thêm vào giỏ hàng!');
    } catch (err: any) {
      console.error('Lỗi thêm vào giỏ hàng:', err);
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

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          {error}
          <br />
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/')}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }
  if (!product) return <div className="alert alert-warning text-center">Sản phẩm không tồn tại</div>;

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
          <p className="mb-2"><strong>Danh mục:</strong> {product.category?.name || 'Không xác định'}</p>
          <p className="mb-2"><strong>Đơn vị:</strong> {product.unit}</p>
          <p className="mb-2"><strong>Số lượng tồn:</strong> {product.quantity_in_stock}</p>
          <p className="mb-2"><strong>Trạng thái:</strong> {product.available ? 'Còn hàng' : 'Hết hàng'}</p>
          <p className="mb-2"><strong>Nhà cung cấp:</strong> {product.supplier?.name || 'Không xác định'}</p>
          <p className="mb-2"><strong>Địa chỉ:</strong> {product.supplier?.address || 'Không xác định'}</p>
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
      <div className="mt-5">
        <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Gợi ý sản phẩm tương tự
        </h2>
        {relatedProducts.length > 0 ? (
          <div className="row">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct._id} className="col-md-3 col-sm-6 mb-4">
                <ProductCard product={relatedProduct} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">Không có sản phẩm tương tự trong danh mục này</p>
        )}
      </div>
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