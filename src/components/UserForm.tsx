import { useState, useEffect, FormEvent } from 'react';
import { createUser, updateUser } from '../services/api';
import { User } from '../types';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  setError: (error: string) => void;
}

const UserForm = ({ user, onSuccess, setError }: UserFormProps) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    address: '',
    phone: '',
    avatar: '',
    delivery_address: '',
    is_active: 'true',
  });

  useEffect(() => {
    console.log('UserForm received user:', user);
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
        address: user.address || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        delivery_address: user.delivery_address || '',
        is_active: user.is_active?.toString() || 'true',
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        address: '',
        phone: '',
        avatar: '',
        delivery_address: '',
        is_active: 'true',
      });
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        name: form.name,
        email: form.email,
        role: form.role,
        address: form.address,
        phone: form.phone,
        avatar: form.avatar || undefined,
        delivery_address: form.delivery_address || undefined,
        is_active: form.is_active === 'true',
      };
      if (!user && form.password) {
        data.password = form.password;
      }

      if (user) {
        await updateUser(user._id, data);
      } else {
        if (!form.password) {
          throw new Error('Mật khẩu là bắt buộc khi tạo người dùng');
        }
        await createUser(data);
      }
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        address: '',
        phone: '',
        avatar: '',
        delivery_address: '',
        is_active: 'true',
      });
      onSuccess();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || `Không thể ${user ? 'cập nhật' : 'thêm'} người dùng`);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-3" style={{ color: '#ee4d2d' }}>
          {user ? 'Sửa người dùng' : 'Thêm người dùng'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="userName" className="form-label">
              Tên
            </label>
            <input
              type="text"
              className="form-control"
              id="userName"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="userEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="userEmail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          {!user && (
            <div className="mb-3">
              <label htmlFor="userPassword" className="form-label">
                Mật khẩu
              </label>
              <input
                type="password"
                className="form-control"
                id="userPassword"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="userRole" className="form-label">
              Vai trò
            </label>
            <select
              className="form-control"
              id="userRole"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            >
              <option value="user">Người dùng</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="userAddress" className="form-label">
              Địa chỉ
            </label>
            <input
              type="text"
              className="form-control"
              id="userAddress"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="userPhone" className="form-label">
              Điện thoại
            </label>
            <input
              type="text"
              className="form-control"
              id="userPhone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="userAvatar" className="form-label">
              URL ảnh đại diện (tùy chọn)
            </label>
            <input
              type="text"
              className="form-control"
              id="userAvatar"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="userDeliveryAddress" className="form-label">
              Địa chỉ giao hàng (tùy chọn)
            </label>
            <input
              type="text"
              className="form-control"
              id="userDeliveryAddress"
              value={form.delivery_address}
              onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="userIsActive" className="form-label">
              Kích hoạt
            </label>
            <select
              className="form-control"
              id="userIsActive"
              value={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.value })}
              required
            >
              <option value="true">Có</option>
              <option value="false">Không</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
          >
            {user ? 'Cập nhật' : 'Thêm'} người dùng
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;