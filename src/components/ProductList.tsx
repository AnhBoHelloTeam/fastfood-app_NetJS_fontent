import { Product, Category, Supplier } from '../types';
import { deleteProduct } from '../services/api';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  onEdit: (product: Product) => void;
  onDeleteSuccess: () => void;
  setError: (error: string) => void;
}

const ProductList = ({ products, categories, suppliers, onEdit, onDeleteSuccess, setError }: ProductListProps) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(id);
        onDeleteSuccess();
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
      }
    }
  };

  const handleEdit = (product: Product) => {
    console.log('Editing product:', product);
    onEdit(product);
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : 'Không xác định';
  };

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find((sup) => sup._id === supplierId);
    return supplier ? supplier.name : 'Không xác định';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = 'https://placehold.co/50x50';
    e.currentTarget.onerror = null; // Ngăn lặp lỗi
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-3" style={{ color: '#ee4d2d' }}>
          Danh sách sản phẩm
        </h3>
        {products.length === 0 ? (
          <p className="text-muted">Không có sản phẩm nào</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#ee4d2d', color: 'white' }}>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Giá</th>
                  <th>Danh mục</th>
                  <th>Nhà cung cấp</th>
                  <th>Số lượng</th>
                  <th>Hình ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product._id}</td>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{getCategoryName(product.category._id)}</td>
                    <td>{getSupplierName(product.supplier._id)}</td>
                    <td>{product.quantity_in_stock}</td>
                    <td>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={handleImageError}
                        />
                      ) : (
                        'Không có'
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(product)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;