import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient.js';
import { categoryNames } from '../data/sample.js';
import useProductSearch from '../hooks/useProductSearch.js';
import ProductFilters from '../components/ProductFilters.jsx';
import ProductTable from '../components/ProductTable.jsx';
import Pagination from '../components/Pagination.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { normalizePage } from '../utils/format.js';

const PAGE_LIMIT = 10;

const FALLBACK_CATEGORIES = Object.entries(categoryNames).map(([id, name]) => ({ id, name }));

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const qParam = (searchParams.get('q') || '').trim();
  const categoryParam = searchParams.get('category') || '';
  const statusParam = searchParams.get('status') || '';
  const rawPage = searchParams.get('page');
  const pageParam = normalizePage(rawPage);

  const [searchInput, setSearchInput] = useState(qParam);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [notice, setNotice] = useState(location.state?.message || '');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const { data: products, total, loading, error, reload } = useProductSearch({
    q: qParam,
    category: categoryParam,
    status: statusParam,
    page: pageParam,
    limit: PAGE_LIMIT,
  });

  // Load categories from API
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

  // Show flash message from navigation state and clear state
  useEffect(() => {
    if (location.state?.message) {
      setNotice(location.state.message);
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location, navigate]);

  // Keep search input synced when URL changes externally (e.g. Back/Forward)
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  const updateUrlParams = useCallback(
    (updates, { replace = false } = {}) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === null || val === '' || (key === 'page' && Number(val) <= 1)) {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });

      setSearchParams(next, { replace });
    },
    [searchParams, setSearchParams],
  );

  // Debounce search input -> URL q param (resetting page to 1)
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === qParam) return undefined;

    const timer = setTimeout(() => {
      updateUrlParams({ q: trimmed, page: 1 });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, qParam, updateUrlParams]);

  // Normalize invalid page in URL (e.g. page=-3, page=abc, page=0)
  useEffect(() => {
    if (rawPage !== null && rawPage !== String(pageParam)) {
      updateUrlParams({ page: pageParam }, { replace: true });
    }
  }, [rawPage, pageParam, updateUrlParams]);

  // Clamp out-of-range page (e.g. page=999) when total is known
  useEffect(() => {
    if (loading || error || total === 0) return;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
    if (pageParam > totalPages) {
      updateUrlParams({ page: totalPages }, { replace: true });
    }
  }, [loading, error, total, pageParam, updateUrlParams]);

  const hasActiveFilters = Boolean(qParam || categoryParam || statusParam || searchInput.trim());

  function handleResetFilters() {
    setSearchInput('');
    setSearchParams({});
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/products/${deleteTarget.id}`);
      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      setNotice(`Đã xoá sản phẩm "${deletedName}".`);

      if (products.length === 1 && pageParam > 1) {
        updateUrlParams({ page: pageParam - 1 });
      } else {
        reload();
      }
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

      <ProductFilters
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        category={categoryParam}
        onCategoryChange={(val) => updateUrlParams({ category: val, page: 1 })}
        status={statusParam}
        onStatusChange={(val) => updateUrlParams({ status: val, page: 1 })}
        categories={categories}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {loading && (
        <div className="state-box" role="status">
          <div className="spinner" aria-hidden="true" />
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-box state-error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={reload}>
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="state-box">
          <p>
            {hasActiveFilters
              ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.'
              : 'Chưa có sản phẩm nào.'}
          </p>
          {hasActiveFilters ? (
            <button type="button" className="btn btn-outline" onClick={handleResetFilters}>
              Xoá bộ lọc
            </button>
          ) : (
            <Link to="/products/new" className="btn btn-primary">
              Thêm sản phẩm đầu tiên
            </Link>
          )}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <ProductTable
            products={products}
            categories={categories}
            onDelete={(product) => {
              setDeleteError('');
              setDeleteTarget(product);
            }}
          />
          <Pagination
            page={pageParam}
            limit={PAGE_LIMIT}
            total={total}
            onPageChange={(nextPage) => updateUrlParams({ page: nextPage })}
          />
        </>
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
