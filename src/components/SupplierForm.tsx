import { useState, useEffect, FormEvent } from 'react';
import { createSupplier, updateSupplier } from '../services/api';
import { Supplier } from '../types';

interface SupplierFormProps {
  supplier?: Supplier;
  onSuccess: () => void;
  setError: (error: string) => void;
}

const SupplierForm = ({ supplier, onSuccess, setError }: SupplierFormProps) => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    console.log('SupplierForm received supplier:', supplier);
    if (supplier) {
      setForm({
        name: supplier.name || '',
        address: supplier.address || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
      });
    } else {
      setForm({ name: '', address: '', phone: '', email: '' });
    }
  }, [supplier]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
      };
      if (supplier) {
        await updateSupplier(supplier._id, data);
      } else {
        await createSupplier(data);
      }
      setForm({ name: '', address: '', phone: '', email: '' });
      onSuccess();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || `Không thể ${supplier ? 'cập nhật' : 'thêm'} nhà cung cấp`);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-3" style={{ color: '#ee4d2d' }}>
          {supplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="supplierName" className="form-label">
              Tên nhà cung cấp
            </label>
            <input
              type="text"
              className="form-control"
              id="supplierName"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="supplierAddress" className="form-label">
              Địa chỉ
            </label>
            <input
              type="text"
              className="form-control"
              id="supplierAddress"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="supplierPhone" className="form-label">
              Điện thoại
            </label>
            <input
              type="text"
              className="form-control"
              id="supplierPhone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="supplierEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="supplierEmail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
          >
            {supplier ? 'Cập nhật' : 'Thêm'} nhà cung cấp
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;