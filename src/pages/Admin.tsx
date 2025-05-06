import { useState, useEffect } from 'react';
import { getCategories, getSuppliers, getProducts, getUsers, getPromotions } from '../services/api';
import { Category, Supplier, Product, User, Promotion } from '../types';
import CategoryForm from '../components/CategoryForm';
import SupplierForm from '../components/SupplierForm';
import ProductForm from '../components/ProductForm';
import UserForm from '../components/UserForm';
import CategoryList from '../components/CategoryList';
import SupplierList from '../components/SupplierList';
import ProductList from '../components/ProductList';
import UserList from '../components/UserList';
import PromotionForm from '../components/PromotionForm';
import PromotionList from '../components/PromotionList';

const Admin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editCategory, setEditCategory] = useState<Category | undefined>(undefined);
  const [editSupplier, setEditSupplier] = useState<Supplier | undefined>(undefined);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);
  const [editUser, setEditUser] = useState<User | undefined>(undefined);
  const [editPromotion, setEditPromotion] = useState<Promotion | undefined>(undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, suppliersRes, productsRes, usersRes, promotionsRes] = await Promise.all([
        getCategories(),
        getSuppliers(),
        getProducts(),
        getUsers(),
        getPromotions(),
      ]);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setPromotions(Array.isArray(promotionsRes.data) ? promotionsRes.data : []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ee4d2d' }}>
        Trang quản trị
      </h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-center mt-5">Đang tải...</div>}

      {!loading && (
        <div className="row">
          {/* Form thêm/sửa danh mục */}
          <div className="col-md-4 mb-4">
            <CategoryForm
              category={editCategory}
              onSuccess={() => {
                setEditCategory(undefined);
                fetchData();
              }}
              setError={setError}
            />
          </div>

          {/* Form thêm/sửa nhà cung cấp */}
          <div className="col-md-4 mb-4">
            <SupplierForm
              supplier={editSupplier}
              onSuccess={() => {
                setEditSupplier(undefined);
                fetchData();
              }}
              setError={setError}
            />
          </div>

          {/* Form thêm/sửa sản phẩm */}
          <div className="col-md-4 mb-4">
            <ProductForm
              product={editProduct}
              categories={categories}
              suppliers={suppliers}
              onSuccess={() => {
                setEditProduct(undefined);
                fetchData();
              }}
              setError={setError}
            />
          </div>

          {/* Form thêm/sửa người dùng */}
          <div className="col-md-4 mb-4">
            <UserForm
              user={editUser}
              onSuccess={() => {
                setEditUser(undefined);
                fetchData();
              }}
              setError={setError}
            />
          </div>

          {/* Form thêm/sửa mã giảm giá */}
          <div className="col-md-4 mb-4">
            <PromotionForm
              promotion={editPromotion}
              onSuccess={() => {
                setEditPromotion(undefined);
                fetchData();
              }}
              setError={setError}
            />
          </div>

          {/* Bảng danh mục */}
          <div className="col-12 mb-4">
            <CategoryList
              categories={categories}
              onEdit={(category) => setEditCategory(category)}
              onDeleteSuccess={fetchData}
              setError={setError}
            />
          </div>

          {/* Bảng nhà cung cấp */}
          <div className="col-12 mb-4">
            <SupplierList
              suppliers={suppliers}
              onEdit={(supplier) => setEditSupplier(supplier)}
              onDeleteSuccess={fetchData}
              setError={setError}
            />
          </div>

          {/* Bảng sản phẩm */}
          <div className="col-12 mb-4">
            <ProductList
              products={products}
              categories={categories}
              suppliers={suppliers}
              onEdit={(product) => setEditProduct(product)}
              onDeleteSuccess={fetchData}
              setError={setError}
            />
          </div>

          {/* Bảng người dùng */}
          <div className="col-12 mb-4">
            <UserList
              users={users}
              onEdit={(user) => setEditUser(user)}
              onDeleteSuccess={fetchData}
              setError={setError}
            />
          </div>

          {/* Bảng mã giảm giá */}
          <div className="col-12 mb-4">
            <PromotionList
              promotions={promotions}
              onEdit={(promotion) => setEditPromotion(promotion)}
              onDeleteSuccess={fetchData}
              onToggleSuccess={fetchData}
              setError={setError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

// CSS tùy chỉnh
const styles = `
  .btn:hover {
    background-color: #d43f21 !important;
    color: white !important;
  }
  .btn-warning {
    background-color: #ffc107 !important;
    border-color: #ffc107 !important;
  }
  .btn-warning:hover {
    background-color: #e0a800 !important;
    border-color: #e0a800 !important;
  }
  .btn-danger {
    background-color: #dc3545 !important;
    border-color: #dc3545 !important;
  }
  .btn-danger:hover {
    background-color: #c82333 !important;
    border-color: #c82333 !important;
  }
  .shadow-sm {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .table th, .table td {
    vertical-align: middle;
  }
  .table-hover tbody tr:hover {
    background-color: #f8f9fa;
  }
  .text-muted {
    font-size: 1.1rem;
  }
  .alert-danger {
    font-weight: bold;
  }
  textarea.form-control {
    min-height: 100px;
  }
`;

// Thêm CSS vào trang
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);