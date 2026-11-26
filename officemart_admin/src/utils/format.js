import { categoryNames } from '../data/sample.js';

export function formatPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0 ₫';
  return `${new Intl.NumberFormat('vi-VN').format(num)} ₫`;
}

export function getCategoryLabel(categoryId, categoriesList = []) {
  const found = categoriesList.find((c) => c.id === categoryId);
  if (found) return found.name;
  return categoryNames[categoryId] || categoryId || '—';
}

export function normalizePage(rawPage) {
  const parsed = Number(rawPage);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}
