import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';
import { categoryNames } from '../data/sample.js';
import ProductTable from '../components/ProductTable.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const FALLBACK_CATEGORIES = Object.entries(categoryNames).map(([id, name]) => ({ id, name }));

export default function ProductListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.message || '');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products', { params: { limit: 50 } });
      setProducts(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let active = true;
    api
      .get('/categories')
      .then((res) => {
        if (active && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(() => {
        // Fallback categories already loaded
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setNotice(location.state.message);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/products/${deleteTarget.id}`);
      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      setNotice(`Đã xoá sản phẩm "${deletedName}".`);
      loadProducts();
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Không thể xoá sản phẩm');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <h1 className="page-title">Sản phẩm</h1>
        <Link to="/products/new" className="btn btn-primary">
          Thêm sản phẩm
        </Link>
      </div>

      {notice && (
        <div className="alert alert-success" role="status">
          <span>{notice}</span>
          <button
            type="button"
            className="alert-close"
            aria-label="Đóng thông báo"
            onClick={() => setNotice('')}
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className="state-box" role="status">
          <div className="spinner" aria-hidden="true" />
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-box state-error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={loadProducts}>
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="state-box">
          <p>Chưa có sản phẩm nào.</p>
          <Link to="/products/new" className="btn btn-primary">
            Thêm sản phẩm đầu tiên
          </Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <ProductTable
          products={products}
          categories={categories}
          onDelete={(product) => {
            setDeleteError('');
            setDeleteTarget(product);
          }}
        />
      )}

      <ConfirmModal
        product={deleteTarget}
        deleting={deleting}
        error={deleteError}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
