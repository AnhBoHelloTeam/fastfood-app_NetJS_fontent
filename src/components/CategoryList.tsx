import { Category } from '../types';
import { deleteCategory } from '../services/api';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDeleteSuccess: () => void;
  setError: (error: string) => void;
}

const CategoryList = ({ categories, onEdit, onDeleteSuccess, setError }: CategoryListProps) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await deleteCategory(id);
        onDeleteSuccess();
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể xóa danh mục');
      }
    }
  };

  const handleEdit = (category: Category) => {
    console.log('Editing category:', category);
    onEdit(category);
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
          Danh sách danh mục
        </h3>
        {categories.length === 0 ? (
          <p className="text-muted">Không có danh mục nào</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#ee4d2d', color: 'white' }}>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th>Hình ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category._id}</td>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
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
                        onClick={() => handleEdit(category)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category._id)}
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

export default CategoryList;