export default function ProductFilters({
  searchValue,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  categories = [],
  onReset,
  hasActiveFilters,
}) {
  return (
    <div className="filters-bar">
      <div className="filter-group filter-search">
        <label htmlFor="filter-q" className="sr-only">
          Tìm kiếm sản phẩm
        </label>
        <input
          id="filter-q"
          type="search"
          className="form-input"
          placeholder="Tìm theo tên hoặc SKU..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="filter-category" className="sr-only">
          Danh mục
        </label>
        <select
          id="filter-category"
          className="form-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-status" className="sr-only">
          Trạng thái
        </label>
        <select
          id="filter-status"
          className="form-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button type="button" className="btn btn-outline" onClick={onReset}>
          Xoá bộ lọc
        </button>
      )}
    </div>
  );
}
