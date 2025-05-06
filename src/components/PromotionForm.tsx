import { useState, useEffect, FormEvent } from 'react';
import { addPromotion, updatePromotion } from '../services/api';
import { Promotion } from '../types';

interface PromotionFormProps {
  promotion?: Promotion;
  onSuccess: () => void;
  setError: (error: string) => void;
}

const PromotionForm = ({ promotion, onSuccess, setError }: PromotionFormProps) => {
  const [form, setForm] = useState({
    code: '',
    discountValue: '',
    discountType: 'percentage',
    validFrom: '',
    validTo: '',
    isActive: 'true',
    min_order_value: '',
    max_discount_amount: '',
    usage_limit: '',
    usage_count: '0',
  });

  useEffect(() => {
    if (promotion) {
      const formatDate = (date: string) => new Date(date).toISOString().split('T')[0];
      setForm({
        code: promotion.code || '',
        discountValue: promotion.discountValue?.toString() || '',
        discountType: promotion.discountType || 'percentage',
        validFrom: promotion.validFrom ? formatDate(promotion.validFrom) : '',
        validTo: promotion.validTo ? formatDate(promotion.validTo) : '',
        isActive: promotion.isActive ? 'true' : 'false',
        min_order_value: promotion.min_order_value?.toString() || '',
        max_discount_amount: promotion.max_discount_amount?.toString() || '',
        usage_limit: promotion.usage_limit?.toString() || '',
        usage_count: promotion.usage_count?.toString() || '0',
      });
    } else {
      setForm({
        code: '',
        discountValue: '',
        discountType: 'percentage',
        validFrom: '',
        validTo: '',
        isActive: 'true',
        min_order_value: '',
        max_discount_amount: '',
        usage_limit: '',
        usage_count: '0',
      });
    }
  }, [promotion]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        code: form.code,
        discountValue: parseFloat(form.discountValue),
        discountType: form.discountType as 'percentage' | 'fixed',
        validFrom: form.validFrom,
        validTo: form.validTo,
        isActive: form.isActive === 'true',
        min_order_value: parseFloat(form.min_order_value) || 0,
        max_discount_amount: parseFloat(form.max_discount_amount) || 0,
        usage_limit: parseInt(form.usage_limit) || 0,
        usage_count: parseInt(form.usage_count) || 0,
      };

      if (promotion) {
        await updatePromotion(promotion._id, data);
      } else {
        await addPromotion(data);
      }
      setForm({
        code: '',
        discountValue: '',
        discountType: 'percentage',
        validFrom: '',
        validTo: '',
        isActive: 'true',
        min_order_value: '',
        max_discount_amount: '',
        usage_limit: '',
        usage_count: '0',
      });
      onSuccess();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || `Không thể ${promotion ? 'cập nhật' : 'thêm'} mã giảm giá`);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-3" style={{ color: '#ee4d2d', fontWeight: 'bold' }}>
          {promotion ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="promotionCode" className="form-label">Mã giảm giá</label>
            <input
              type="text"
              className="form-control"
              id="promotionCode"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="discountValue" className="form-label">Giá trị giảm</label>
            <input
              type="number"
              className="form-control"
              id="discountValue"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="discountType" className="form-label">Loại giảm</label>
            <select
              className="form-control"
              id="discountType"
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              required
            >
              <option value="percentage">Phần trăm</option>
              <option value="fixed">Cố định</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="validFrom" className="form-label">Ngày bắt đầu</label>
            <input
              type="date"
              className="form-control"
              id="validFrom"
              value={form.validFrom}
              onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="validTo" className="form-label">Ngày kết thúc</label>
            <input
              type="date"
              className="form-control"
              id="validTo"
              value={form.validTo}
              onChange={(e) => setForm({ ...form, validTo: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="isActive" className="form-label">Trạng thái</label>
            <select
              className="form-control"
              id="isActive"
              value={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.value })}
              required
            >
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="minOrderValue" className="form-label">Giá trị đơn hàng tối thiểu</label>
            <input
              type="number"
              className="form-control"
              id="minOrderValue"
              value={form.min_order_value}
              onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="maxDiscountAmount" className="form-label">Số tiền giảm tối đa</label>
            <input
              type="number"
              className="form-control"
              id="maxDiscountAmount"
              value={form.max_discount_amount}
              onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="usageLimit" className="form-label">Giới hạn sử dụng</label>
            <input
              type="number"
              className="form-control"
              id="usageLimit"
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
              min="0"
            />
          </div>
          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
          >
            {promotion ? 'Cập nhật' : 'Thêm'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PromotionForm;