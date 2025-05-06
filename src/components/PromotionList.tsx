import { Promotion } from '../types';
import { deletePromotion, togglePromotionActive } from '../services/api';

interface PromotionListProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDeleteSuccess: () => void;
  onToggleSuccess: () => void;
  setError: (error: string) => void;
}

const PromotionList = ({ promotions, onEdit, onDeleteSuccess, onToggleSuccess, setError }: PromotionListProps) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
      try {
        await deletePromotion(id);
        onDeleteSuccess();
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể xóa mã giảm giá');
      }
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    if (window.confirm(`Bạn có chắc muốn ${isActive ? 'tắt' : 'bật'} mã giảm giá này?`)) {
      try {
        await togglePromotionActive(id);
        onToggleSuccess();
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || `Không thể ${isActive ? 'tắt' : 'bật'} mã giảm giá`);
      }
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-3" style={{ color: '#ee4d2d', fontWeight: 'bold' }}>
          Danh sách mã giảm giá
        </h3>
        {promotions.length === 0 ? (
          <p className="text-muted">Không có mã giảm giá nào</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#ee4d2d', color: 'white' }}>
                <tr>
                  <th>ID</th>
                  <th>Mã</th>
                  <th>Giá trị giảm</th>
                  <th>Loại giảm</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion._id}>
                    <td>{promotion._id}</td>
                    <td>{promotion.code}</td>
                    <td>
                      {promotion.discountValue} {promotion.discountType === 'percentage' ? '%' : 'VNĐ'}
                    </td>
                    <td>{promotion.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
                    <td>{new Date(promotion.validFrom).toLocaleDateString('vi-VN')}</td>
                    <td>{new Date(promotion.validTo).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`badge ${promotion.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {promotion.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => onEdit(promotion)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => handleDelete(promotion._id)}
                      >
                        Xóa
                      </button>
                      <button
                        className={`btn btn-sm ${promotion.isActive ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggleActive(promotion._id, promotion.isActive)}
                      >
                        {promotion.isActive ? 'Tắt' : 'Bật'}
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

export default PromotionList;