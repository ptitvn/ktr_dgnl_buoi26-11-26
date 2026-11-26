import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import { categoryNames } from '../data/sample.js';
import ProductForm from '../components/ProductForm.jsx';

const FALLBACK_CATEGORIES = Object.entries(categoryNames).map(([id, name]) => ({ id, name }));

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      if (isEdit) {
        setLoading(true);
        setLoadError('');
      }

      try {
        const requests = [api.get('/categories').catch(() => ({ data: FALLBACK_CATEGORIES }))];
        if (isEdit) {
          requests.push(api.get(`/products/${id}`));
        }

        const [catRes, prodRes] = await Promise.all(requests);
        if (!active) return;

        if (Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
        if (isEdit && prodRes?.data) {
          setInitialValues(prodRes.data);
        }
      } catch (err) {
        if (!active) return;
        setLoadError(err.response?.data?.message || err.message || 'Không tìm thấy sản phẩm');
      } finally {
        if (active && isEdit) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        navigate('/products', {
          state: { message: `Đã cập nhật sản phẩm "${payload.name}".` },
        });
      } else {
        await api.post('/products', payload);
        navigate('/products', {
          state: { message: `Đã thêm sản phẩm "${payload.name}".` },
        });
      }
    } catch (err) {
      const data = err.response?.data;
      setServerError({
        message: data?.message || err.message || 'Không thể lưu sản phẩm',
        field: data?.field || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-section page-form-section">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
        <Link to="/products" className="btn btn-outline">
          Quay lại
        </Link>
      </div>

      {loading && (
        <div className="state-box" role="status">
          <div className="spinner" aria-hidden="true" />
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="state-box state-error" role="alert">
          <p>{loadError}</p>
          <Link to="/products" className="btn btn-primary">
            Về danh sách sản phẩm
          </Link>
        </div>
      )}

      {!loading && !loadError && (
        <ProductForm
          initialValues={initialValues}
          categories={categories}
          submitting={submitting}
          serverError={serverError}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
        />
      )}
    </section>
  );
}
