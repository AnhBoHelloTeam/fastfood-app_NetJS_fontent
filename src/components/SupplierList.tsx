import { Supplier } from '../types';
import { deleteSupplier } from '../services/api';

interface SupplierListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDeleteSuccess: () => void;
  setError: (error: string) => void;
}

const SupplierList = ({ suppliers, onEdit, onDeleteSuccess, setError }: SupplierListProps) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
      try {
        await deleteSupplier(id);
        onDeleteSuccess();
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể xóa nhà cung cấp');
      }
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-3" style={{ color: '#ee4d2d' }}>
          Danh sách nhà cung cấp
        </h3>
        {suppliers.length === 0 ? (
          <p className="text-muted">Không có nhà cung cấp nào</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#ee4d2d', color: 'white' }}>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Địa chỉ</th>
                  <th>Điện thoại</th>
                  <th>Email</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td>{supplier._id}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.address}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.email}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => onEdit(supplier)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(supplier._id)}
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

export default SupplierList;