import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  // Lấy vai trò người dùng từ token
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('isAuthenticated:', isAuthenticated); // Debug
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('Token payload:', decoded); // Debug
        setUserRole(decoded.role || 'user');
      } catch (err) {
        console.error('Lỗi giải mã token:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole('');
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${search}`);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-shopeefood text-white">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src="https://shopeefood.vn/assets/icon/logo.png" alt="ShopeeFood" style={{ height: '40px' }} />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <form className="d-flex w-100 my-2 my-lg-0 search-bar" onSubmit={handleSearch}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Tìm món ăn, quán ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-shopeefood text-white" type="submit">
              Tìm
            </button>
          </form>
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item d-flex align-items-center">
              {isAuthenticated && (
                <span className="badge bg-light text-dark ms-2">
                  Vai trò: {userRole}
                </span>
              )}
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/cart">
                    Giỏ hàng
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/chat">
                    Chat
                  </Link>
                </li>
                {isAuthenticated && userRole === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/admin" title="Quản trị">
                      <i className="bi bi-gear-fill"></i>
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="nav-link btn btn-link text-white" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">
                    Đăng nhập
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/register">
                    Đăng ký
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// CSS tùy chỉnh
const styles = `
  .navbar-shopeefood {
    background-color: #ee4d2d !important;
  }
  .btn-shopeefood {
    background-color: #ee4d2d !important;
    border-color: #ee4d2d !important;
  }
  .btn-shopeefood:hover {
    background-color: #d43f21 !important;
    border-color: #d43f21 !important;
  }
  .search-bar {
    max-width: 500px;
  }
  .nav-link:hover {
    color: #fff !important;
    opacity: 0.8;
  }
  .bi-gear-fill {
    font-size: 1.2rem;
  }
`;

// Thêm CSS vào trang
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);