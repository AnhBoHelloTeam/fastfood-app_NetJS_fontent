import { Modal, Button } from 'react-bootstrap';
import { Promotion } from '../types';

interface PromotionDetailModalProps {
  show: boolean;
  onHide: () => void;
  promotion: Promotion | null;
}

const PromotionDetailModal = ({ show, onHide, promotion }: PromotionDetailModalProps) => {
  if (!promotion) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: '#ee4d2d', fontWeight: 'bold' }}>
          Chi tiết mã giảm giá: {promotion.code}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Mã:</strong> {promotion.code}</p>
        <p>
          <strong>Giá trị giảm:</strong>{' '}
          {promotion.discountType === 'percentage'
            ? `${promotion.discountValue}%`
            : `${promotion.discountValue.toLocaleString('vi-VN')} VND`}
        </p>
        <p><strong>Loại giảm:</strong> {promotion.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}</p>
        <p><strong>Ngày bắt đầu:</strong> {formatDate(promotion.validFrom)}</p>
        <p><strong>Ngày kết thúc:</strong> {formatDate(promotion.validTo)}</p>
        <p><strong>Trạng thái:</strong> {promotion.isActive ? 'Hoạt động' : 'Không hoạt động'}</p>
        <p><strong>Đơn hàng tối thiểu:</strong> {promotion.min_order_value.toLocaleString('vi-VN')} VND</p>
        <p><strong>Giảm tối đa:</strong> {promotion.max_discount_amount.toLocaleString('vi-VN')} VND</p>
        <p><strong>Giới hạn sử dụng:</strong> {promotion.usage_limit || 'Không giới hạn'}</p>
        <p><strong>Số lần đã dùng:</strong> {promotion.usage_count}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          style={{ backgroundColor: '#6c757d', borderColor: '#6c757d', fontWeight: 'bold' }}
        >
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PromotionDetailModal;