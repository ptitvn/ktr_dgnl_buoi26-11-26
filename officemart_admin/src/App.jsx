import { Link, Navigate, Route, Routes } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="container top-bar-inner">
          <Link to="/products" className="brand-link">
            OfficeMart Admin
          </Link>
        </div>
      </header>

      <main className="container main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </div>
  );
}
