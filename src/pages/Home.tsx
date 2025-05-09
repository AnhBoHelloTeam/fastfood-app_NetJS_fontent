import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getProducts, getCategories, getProductFeedback } from '../services/api';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { FaShoppingCart, FaStar } from 'react-icons/fa';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        setCategories(categoriesRes.data);
        let filteredProducts = productsRes.data;
        if (search) {
          filteredProducts = productsRes.data.filter((p: Product) =>
            p.name.toLowerCase().includes(search.toLowerCase())
          );
        }
        // Lấy đánh giá trung bình cho mỗi sản phẩm
        const productsWithRatings = await Promise.all(
          filteredProducts.map(async (product: Product) => {
            try {
              const response = await getProductFeedback(product._id);
              return { ...product, ...response.data };
            } catch (err) {
              return { ...product, averageRating: 0, totalFeedbacks: 0 };
            }
          })
        );
        setProducts(productsWithRatings);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search]);

  return (
    <div className="container mt-4 mb-5">
      {/* Nút xem đơn hàng và lịch sử đánh giá */}
      <div className="mb-4 flex justify-end space-x-2">
        <button
          className="flex items-center bg-orange-200 text-black px-4 py-2 rounded hover:bg-orange-300 transition"
          style={{ fontWeight: '500' }}
          onClick={() => navigate('/orders')}
        >
          {/* @ts-ignore */}
          <FaShoppingCart className="mr-2" />
          Xem đơn hàng
        </button>
        <button
          className="flex items-center bg-orange-200 text-black px-4 py-2 rounded hover:bg-orange-300 transition"
          style={{ fontWeight: '500' }}
          onClick={() => navigate('/feedback-history')}
        >
          {/* @ts-ignore */}
          <FaStar className="mr-2" />
          Lịch sử đánh giá
        </button>
      </div>

      {/* Danh sách danh mục */}
      <div className="mb-4">
        <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Danh mục sản phẩm
        </h3>
        <ul className="nav nav-pills">
          {categories.map((category) => (
            <li key={category._id} className="nav-item">
              <Link
                className="nav-link"
                to={`/category/${category._id}`}
                style={{ color: '#ee4d2d', fontWeight: '500' }}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Danh sách sản phẩm */}
      <h1 className="mb-4 text-center" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        Thực đơn
      </h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-center mt-5">Đang tải...</div>}
      {!loading && (
        <div className="row">
          {products.length === 0 ? (
            <p className="text-center">Không tìm thấy sản phẩm</p>
          ) : (
            products.map((product) => (
              <div key={product._id} className="col-md-4 col-sm-6 mb-4">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;