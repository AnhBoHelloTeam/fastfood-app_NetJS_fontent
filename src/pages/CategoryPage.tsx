import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsByCategory, getCategories } from '../services/api';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh mục
        const categoriesRes = await getCategories();
        console.log('Categories:', categoriesRes.data); // Debug
        const foundCategory = categoriesRes.data.find((cat: Category) => cat._id === parseInt(id || '0'));
        if (!foundCategory) {
          throw new Error('Không tìm thấy danh mục');
        }
        setCategory(foundCategory);

        // Lấy sản phẩm theo danh mục
        const productsRes = await getProductsByCategory(parseInt(id || '0'));
        console.log('Products for category', id, ':', productsRes.data); // Debug
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu danh mục hoặc sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="container mt-4 mb-5">
      {/* Tiêu đề danh mục */}
      <h1 className="mb-4" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {category ? category.name : 'Danh mục'}
      </h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-center mt-5">Đang tải...</div>}

      {/* Danh sách sản phẩm */}
      {!loading && (
        <div className="row">
          {products.length === 0 ? (
            <p className="text-muted">Không tìm thấy sản phẩm trong danh mục này</p>
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

export default CategoryPage;

// CSS tùy chỉnh
const styles = `
  .alert-danger {
    font-weight: bold;
  }
  .text-muted {
    font-size: 1.1rem;
  }
`;

// Thêm CSS vào trang
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);