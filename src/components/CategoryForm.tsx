import { useState, useEffect, FormEvent } from 'react';
import { createCategory, updateCategory } from '../services/api';
import { Category } from '../types';

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  setError: (error: string) => void;
}

const CategoryForm = ({ category, onSuccess, setError }: CategoryFormProps) => {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    image: '',
    parent_id: '',
  });

  useEffect(() => {
    console.log('CategoryForm received category:', category);
    if (category) {
      setForm({
        name: category.name || '',
        slug: category.slug || '',
        image: category.image || '',
        parent_id: category.parent_id?.toString() || '',
      });
    } else {
      setForm({ name: '', slug: '', image: '', parent_id: '' });
    }
  }, [category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        name: form.name,
        slug: form.slug,
      };
      if (form.image) data.image = form.image;
      if (form.parent_id) data.parent_id = parseInt(form.parent_id);

      if (category) {
        await updateCategory(category._id, data);
      } else {
        await createCategory(data);
      }
      setForm({ name: '', slug: '', image: '', parent_id: '' });
      onSuccess();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || `Không thể ${category ? 'cập nhật' : 'thêm'} danh mục`);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-3" style={{ color: '#ee4d2d' }}>
          {category ? 'Sửa danh mục' : 'Thêm danh mục'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="categoryName" className="form-label">
              Tên danh mục
            </label>
            <input
              type="text"
              className="form-control"
              id="categoryName"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="categorySlug" className="form-label">
              Slug
            </label>
            <input
              type="text"
              className="form-control"
              id="categorySlug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="categoryImage" className="form-label">
              URL hình ảnh (tùy chọn)
            </label>
            <input
              type="text"
              className="form-control"
              id="categoryImage"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="categoryParentId" className="form-label">
              ID danh mục cha (tùy chọn)
            </label>
            <input
              type="number"
              className="form-control"
              id="categoryParentId"
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
          >
            {category ? 'Cập nhật' : 'Thêm'} danh mục
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;