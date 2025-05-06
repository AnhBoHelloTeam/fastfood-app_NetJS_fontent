import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  address: string;
  phone: string;
  avatar: string;
  delivery_address: string;
  is_active?: boolean;
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    address: '',
    phone: '',
    avatar: '',
    delivery_address: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra các trường bắt buộc
    const requiredFields: (keyof RegisterFormData)[] = ['name', 'email', 'password', 'address', 'phone', 'delivery_address'];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      setError(`Vui lòng cung cấp đầy đủ thông tin để đăng ký: ${missingFields.join(', ')}`);
      return;
    }
    try {
      await register({ ...formData, is_active: true });
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h2 className="text-center mb-4">Đăng ký</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Họ tên</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập họ tên"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập email"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập địa chỉ"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="delivery_address" className="form-label">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập địa chỉ giao hàng"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="avatar" className="form-label">Ảnh đại diện (URL)</label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nhập URL ảnh đại diện (tùy chọn)"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Vai trò</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="user">Khách hàng</option>
                </select>
              </div>
              <button type="submit" className="btn btn-shopeefood text-white w-100">
                Đăng ký
              </button>
            </form>
            <p className="text-center mt-3">
              Đã có tài khoản? <a href="/login">Đăng nhập</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;