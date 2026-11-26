import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axiosClient.js';
import { normalizePage } from '../utils/format.js';

export default function useProductSearch(params = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const category = params.category || '';
  const status = params.status || '';
  const page = normalizePage(params.page);
  const limit = Number.isInteger(Number(params.limit)) && Number(params.limit) > 0 ? Number(params.limit) : 10;

  const reload = useCallback(() => {
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const queryParams = { page, limit };
        if (q) queryParams.q = q;
        if (category) queryParams.category = category;
        if (status) queryParams.status = status;

        const res = await api.get('/products', {
          params: queryParams,
          signal: controller.signal,
        });

        if (cancelled) return;
        setData(Array.isArray(res.data?.data) ? res.data.data : []);
        setTotal(typeof res.data?.total === 'number' ? res.data.total : 0);
      } catch (err) {
        if (cancelled || axios.isCancel(err) || err.name === 'CanceledError' || controller.signal.aborted) {
          return;
        }
        const message = err.response?.data?.message || err.message || 'Không thể tải danh sách sản phẩm';
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [q, category, status, page, limit, reloadTick]);

  return { data, total, loading, error, reload };
}
