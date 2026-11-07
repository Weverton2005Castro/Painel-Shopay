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

function AdminGuard() {
  const { authReady, isAuthenticated } = useAuth();
  if (!authReady) return <LoadingSpinner />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin" replace />;
}

function Shell() {
  const { pathname, hash } = useLocation();

  if (pathname === '/' && hash === '#ofertas') return <Navigate replace to="/catalog?partner=1&sort=price-asc" />;
  if (pathname === '/' && hash === '#novidades') return <Navigate replace to="/catalog?sort=newest" />;

  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="flex min-h-screen flex-col bg-brand-100">
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/admin" element={<AdminLogin />} />
              <Route element={<AdminGuard />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/images" element={<ManageImages />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:p-3">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
