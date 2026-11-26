const SKU_REGEX = /^[A-Z]{3}-\d{4}$/;

export function validateProductForm(values, validCategories = []) {
  const errors = {};
  const name = typeof values.name === 'string' ? values.name.trim() : '';

  if (name.length < 3 || name.length > 100) {
    errors.name = 'Tên sản phẩm từ 3 đến 100 ký tự';
  }

  const sku = typeof values.sku === 'string' ? values.sku.trim() : '';
  if (!SKU_REGEX.test(sku)) {
    errors.sku = 'SKU có dạng ABC-1234 (3 chữ in hoa, dấu gạch ngang, 4 chữ số)';
  }

  if (!values.category || (validCategories.length > 0 && !validCategories.some((c) => c.id === values.category))) {
    errors.category = 'Vui lòng chọn danh mục hợp lệ';
  }

  const price = Number(values.price);
  if (values.price === '' || values.price === null || values.price === undefined || !Number.isFinite(price) || price <= 0) {
    errors.price = 'Giá phải lớn hơn 0';
  }

  const stock = Number(values.stock);
  if (
    values.stock === '' ||
    values.stock === null ||
    values.stock === undefined ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    errors.stock = 'Tồn kho phải là số nguyên không âm';
  }

  if (!['active', 'inactive'].includes(values.status)) {
    errors.status = 'Trạng thái không hợp lệ';
  }

  return errors;
}
