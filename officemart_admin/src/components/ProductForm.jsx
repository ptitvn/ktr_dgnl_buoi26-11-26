import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { validateProductForm } from '../utils/validation.js';

const INITIAL_VALUES = {
  name: '',
  sku: '',
  category: '',
  price: '',
  stock: '0',
  status: 'active',
};

export default function ProductForm({
  initialValues,
  categories = [],
  submitting = false,
  serverError = null,
  onSubmit,
  submitLabel = 'Lưu sản phẩm',
}) {
  const [values, setValues] = useState({ ...INITIAL_VALUES, ...initialValues });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name ?? '',
        sku: initialValues.sku ?? '',
        category: initialValues.category ?? (categories[0]?.id || ''),
        price: initialValues.price ?? '',
        stock: initialValues.stock ?? '0',
        status: initialValues.status ?? 'active',
      });
    } else if (categories.length > 0) {
      setValues((prev) => (prev.category ? prev : { ...prev, category: categories[0].id }));
    }
  }, [initialValues, categories]);

  useEffect(() => {
    if (serverError?.field && serverError?.message) {
      setErrors((prev) => ({ ...prev, [serverError.field]: serverError.message }));
    }
  }, [serverError]);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const normalized = {
      name: values.name.trim(),
      sku: values.sku.trim().toUpperCase(),
      category: values.category,
      price: values.price === '' ? '' : Number(values.price),
      stock: values.stock === '' ? '' : Number(values.stock),
      status: values.status,
    };

    const validationErrors = validateProductForm(normalized, categories);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit(normalized);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {serverError && !serverError.field && (
        <div className="alert alert-error" role="alert">
          {serverError.message || 'Có lỗi xảy ra, vui lòng thử lại.'}
        </div>
      )}

      <div className="form-grid">
        <div className="form-field form-field-full">
          <label htmlFor="product-name" className="form-label">
            Tên sản phẩm <span className="required">*</span>
          </label>
          <input
            id="product-name"
            name="name"
            type="text"
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            placeholder="Ví dụ: Bàn phím cơ K87"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="product-sku" className="form-label">
            SKU <span className="required">*</span>
          </label>
          <input
            id="product-sku"
            name="sku"
            type="text"
            className={`form-input ${errors.sku ? 'input-error' : ''}`}
            placeholder="Ví dụ: KEY-0121"
            value={values.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
          />
          {errors.sku && <p className="field-error">{errors.sku}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="product-category" className="form-label">
            Danh mục <span className="required">*</span>
          </label>
          <select
            id="product-category"
            name="category"
            className={`form-select ${errors.category ? 'input-error' : ''}`}
            value={values.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="product-price" className="form-label">
            Giá (VNĐ) <span className="required">*</span>
          </label>
          <input
            id="product-price"
            name="price"
            type="number"
            min="1"
            step="1000"
            className={`form-input ${errors.price ? 'input-error' : ''}`}
            placeholder="Ví dụ: 450000"
            value={values.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />
          {errors.price && <p className="field-error">{errors.price}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="product-stock" className="form-label">
            Tồn kho <span className="required">*</span>
          </label>
          <input
            id="product-stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            className={`form-input ${errors.stock ? 'input-error' : ''}`}
            value={values.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
          />
          {errors.stock && <p className="field-error">{errors.stock}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="product-status" className="form-label">
            Trạng thái <span className="required">*</span>
          </label>
          <select
            id="product-status"
            name="status"
            className={`form-select ${errors.status ? 'input-error' : ''}`}
            value={values.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
          {errors.status && <p className="field-error">{errors.status}</p>}
        </div>
      </div>

      <div className="form-actions">
        <Link to="/products" className="btn btn-outline">
          Huỷ
        </Link>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
