export default function ConfirmModal({
  product,
  deleting,
  error,
  onCancel,
  onConfirm,
}) {
  if (!product) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal-card">
        <h2 id="delete-modal-title" className="modal-title">
          Xác nhận xoá sản phẩm
        </h2>
        <p className="modal-body">
          Bạn có chắc chắn muốn xoá sản phẩm <strong>{product.name}</strong> ({product.sku})? Hành động này không thể hoàn tác.
        </p>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={deleting}>
            Huỷ
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Đang xoá...' : 'Xoá sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
}
