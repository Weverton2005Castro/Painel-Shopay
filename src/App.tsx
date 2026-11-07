import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';
import { StoreScope } from './hooks/useStore';
const AdminStores = lazy(() => import('./pages/AdminStores'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ManageImages = lazy(() => import('./pages/ManageImages'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function LegacyLinks() {
  const { pathname, hash } = useLocation();
  if (pathname === '/' && hash === '#ofertas') return <Navigate replace to="/catalog?partner=1&sort=price-asc" />;
  if (pathname === '/' && hash === '#novidades') return <Navigate replace to="/catalog?sort=newest" />;
  return null;
}

function AdminGuard() {
  const { authReady, isAuthenticated } = useAuth();
  if (!authReady) return <LoadingSpinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin" replace />;
}

function AdminLayout() {
  return (
    <main className="min-h-screen bg-brand-100">
      <Suspense fallback={<LoadingSpinner />}><Outlet /></Suspense>
    </main>
  );
}

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:p-3">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LegacyLinks />
        <ScrollToTop />
        <Routes>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminLogin />} />
            <Route element={<AdminGuard />}>
              <Route path="dashboard" element={<AdminStores />} />
              <Route path="images" element={<Navigate to="/admin/lojas/shopay/imagens" replace />} />
              <Route path="lojas/:slug" element={<StoreScope admin />}>
                <Route index element={<AdminDashboard />} />
                <Route path="imagens" element={<ManageImages />} />
              </Route>
            </Route>
          </Route>
          <Route element={<StoreScope />}>
            <Route element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="product/:id" element={<ProductDetail />} />
            </Route>
          </Route>
          <Route path="loja/:slug" element={<StoreScope />}>
            <Route element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="product/:id" element={<ProductDetail />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
