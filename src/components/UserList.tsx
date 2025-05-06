import { User } from '../types';
import { deleteUser } from '../services/api';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDeleteSuccess: () => void;
  setError: (error: string) => void;
}

const UserList = ({ users, onEdit, onDeleteSuccess, setError }: UserListProps) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await deleteUser(id);
        onDeleteSuccess();
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể xóa người dùng');
      }
    }
  };

  const handleEdit = (user: User) => {
    console.log('Editing user:', user);
    onEdit(user);
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
          Danh sách người dùng
        </h3>
        {users.length === 0 ? (
          <p className="text-muted">Không có người dùng nào</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead style={{ backgroundColor: '#ee4d2d', color: 'white' }}>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Điện thoại</th>
                  <th>Ảnh đại diện</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.phone}</td>
                    <td>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
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
                        onClick={() => handleEdit(user)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user._id)}
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

export default UserList;