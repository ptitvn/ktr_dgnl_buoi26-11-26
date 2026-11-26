import { Link } from 'react-router-dom';
import { formatPrice, getCategoryLabel } from '../utils/format.js';

export default function ProductTable({ products = [], categories = [], onDelete }) {
  return (
    <div className="table-card">
      <table className="product-table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>SKU</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isOutOfStock = Number(product.stock) === 0;
            const isActive = product.status === 'active';

            return (
              <tr key={product.id} data-testid="product-row">
                <td data-label="Tên" className="cell-name">
                  {product.name}
                </td>
                <td data-label="SKU" className="cell-sku">
                  {product.sku}
                </td>
                <td data-label="Danh mục">
                  {getCategoryLabel(product.category, categories)}
                </td>
                <td data-label="Giá" className="cell-price">
                  {formatPrice(product.price)}
                </td>
                <td data-label="Tồn kho">
                  {isOutOfStock ? (
                    <span className="stock-empty">Hết hàng</span>
                  ) : (
                    product.stock
                  )}
                </td>
                <td data-label="Trạng thái">
                  <span
                    data-testid="product-status"
                    className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}
                  >
                    {isActive ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </td>
                <td data-label="Thao tác" className="cell-actions">
                  <div className="action-group">
                    <Link to={`/products/${product.id}/edit`} className="btn btn-outline btn-sm">
                      Sửa
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      onClick={() => onDelete?.(product)}
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
