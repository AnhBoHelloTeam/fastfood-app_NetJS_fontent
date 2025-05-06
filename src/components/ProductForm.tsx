import { useState, useEffect, FormEvent } from 'react';
import { addProduct, updateProduct } from '../services/api';
import { Product, Category, Supplier } from '../types';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  suppliers: Supplier[];
  onSuccess: () => void;
  setError: (error: string) => void;
}

const ProductForm = ({ product, categories, suppliers, onSuccess, setError }: ProductFormProps) => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    description_detail: '',
    image: '',
    category: '',
    available: 'true',
    unit: '',
    slug: '',
    discount_price: '',
    start_discount: '',
    end_discount: '',
    quantity_in_stock: '',
    supplier: '',
  });

  useEffect(() => {
    console.log('ProductForm received product:', product);
    if (product) {
      // Định dạng ngày thành YYYY-MM-DD
      const formatDate = (date?: string) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0]; // Trả về YYYY-MM-DD
      };

      const newForm = {
        name: product.name || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        description_detail: product.description_detail || '',
        image: product.image || '',
        category: product.category?._id?.toString() || '',
        available: product.available?.toString() || 'true',
        unit: product.unit || '',
        slug: product.slug || '',
        discount_price: product.discount_price?.toString() || '',
        start_discount: formatDate(product.start_discount),
        end_discount: formatDate(product.end_discount),
        quantity_in_stock: product.quantity_in_stock?.toString() || '',
        supplier: product.supplier?._id?.toString() || '',
      };
      setForm(newForm);
      console.log('ProductForm updated form:', newForm);
      console.log('start_discount:', newForm.start_discount, 'end_discount:', newForm.end_discount);
    } else {
      const resetForm = {
        name: '',
        price: '',
        description: '',
        description_detail: '',
        image: '',
        category: '',
        available: 'true',
        unit: '',
        slug: '',
        discount_price: '',
        start_discount: '',
        end_discount: '',
        quantity_in_stock: '',
        supplier: '',
      };
      setForm(resetForm);
      console.log('ProductForm reset form:', resetForm);
    }
  }, [product]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        image: form.image,
        category: parseInt(form.category),
        available: form.available === 'true',
        unit: form.unit,
        slug: form.slug,
        quantity_in_stock: parseInt(form.quantity_in_stock),
        supplier: parseInt(form.supplier),
      };
      if (form.description_detail) data.description_detail = form.description_detail;
      if (form.discount_price) data.discount_price = parseFloat(form.discount_price);
      if (form.start_discount) data.start_discount = form.start_discount;
      if (form.end_discount) data.end_discount = form.end_discount;

      if (product) {
        await updateProduct(product._id, data);
      } else {
        await addProduct(data);
      }
      setForm({
        name: '',
        price: '',
        description: '',
        description_detail: '',
        image: '',
        category: '',
        available: 'true',
        unit: '',
        slug: '',
        discount_price: '',
        start_discount: '',
        end_discount: '',
        quantity_in_stock: '',
        supplier: '',
      });
      onSuccess();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || `Không thể ${product ? 'cập nhật' : 'thêm'} sản phẩm`);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="mb-3" style={{ color: '#ee4d2d' }}>
          {product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="productName" className="form-label">
              Tên sản phẩm
            </label>
            <input
              type="text"
              className="form-control"
              id="productName"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productPrice" className="form-label">
              Giá
            </label>
            <input
              type="number"
              className="form-control"
              id="productPrice"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productDescription" className="form-label">
              Mô tả ngắn
            </label>
            <input
              type="text"
              className="form-control"
              id="productDescription"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productDescriptionDetail" className="form-label">
              Mô tả chi tiết (tùy chọn)
            </label>
            <textarea
              className="form-control"
              id="productDescriptionDetail"
              value={form.description_detail}
              onChange={(e) => setForm({ ...form, description_detail: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productImage" className="form-label">
              URL hình ảnh
            </label>
            <input
              type="text"
              className="form-control"
              id="productImage"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productCategory" className="form-label">
              Danh mục
            </label>
            <select
              className="form-control"
              id="productCategory"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="productAvailable" className="form-label">
              Có sẵn
            </label>
            <select
              className="form-control"
              id="productAvailable"
              value={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.value })}
              required
            >
              <option value="true">Có</option>
              <option value="false">Không</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="productUnit" className="form-label">
              Đơn vị
            </label>
            <input
              type="text"
              className="form-control"
              id="productUnit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productSlug" className="form-label">
              Slug
            </label>
            <input
              type="text"
              className="form-control"
              id="productSlug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productDiscountPrice" className="form-label">
              Giá khuyến mãi (tùy chọn)
            </label>
            <input
              type="number"
              className="form-control"
              id="productDiscountPrice"
              value={form.discount_price}
              onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productStartDiscount" className="form-label">
              Bắt đầu khuyến mãi (tùy chọn)
            </label>
            <input
              type="date"
              className="form-control"
              id="productStartDiscount"
              value={form.start_discount}
              onChange={(e) => setForm({ ...form, start_discount: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productEndDiscount" className="form-label">
              Kết thúc khuyến mãi (tùy chọn)
            </label>
            <input
              type="date"
              className="form-control"
              id="productEndDiscount"
              value={form.end_discount}
              onChange={(e) => setForm({ ...form, end_discount: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productQuantityInStock" className="form-label">
              Số lượng tồn kho
            </label>
            <input
              type="number"
              className="form-control"
              id="productQuantityInStock"
              value={form.quantity_in_stock}
              onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
              required
              min="0"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="productSupplier" className="form-label">
              Nhà cung cấp
            </label>
            <select
              className="form-control"
              id="productSupplier"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              required
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: '#ee4d2d', fontWeight: 'bold' }}
          >
            {product ? 'Cập nhật' : 'Thêm'} sản phẩm
          </button>
        </form>
      </div>
    </div>
  );
};

// CSS debug
const styles = `
  .form-control {
    border: 2px solid blue !important;
  }
  input[type="date"] {
    color: #000 !important;
    background-color: #fff !important;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ProductForm;