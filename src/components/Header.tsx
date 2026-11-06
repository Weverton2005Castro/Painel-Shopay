import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/#ofertas', label: 'Ofertas' },
  { to: '/#novidades', label: 'Novidades' },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setMobileMenuOpen(false);
      navigate(`/catalog?search=${encodeURIComponent(q)}`);
    }
  };

  const isActive = (to: string) => {
    const path = to.split('#')[0];
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <header className="shop-header sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-3 group" aria-label="Shopay — página inicial">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-950 shadow-soft transition-shadow group-hover:shadow-medium">
              <span className="brand-name text-2xl font-semibold text-accent-200">S</span>
            </div>
            <div>
              <span className="brand-name text-2xl font-bold text-brand-950">Shopay</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-400">
                vitrine de produtos
              </span>
            </div>
          </Link>

          <form onSubmit={handleSearch} role="search" className="hidden flex-1 md:flex md:max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                aria-label="Buscar produtos"
                placeholder="Buscar produtos, marcas, categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-brand-50/70 py-2.5 pl-10 pr-4 text-sm text-brand-950 placeholder:text-brand-400 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/15"
              />
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive(link.to)
                    ? 'bg-brand-950 text-white'
                    : 'text-brand-600 hover:bg-brand-100 hover:text-brand-950'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200 text-brand-700 lg:hidden"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-brand-100 pb-4 lg:hidden">
            <form onSubmit={handleSearch} role="search" className="py-3">
              <div className="relative">
                <input
                  type="text"
                  aria-label="Buscar produtos"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/70 py-2.5 pl-10 pr-4 text-sm text-brand-950 placeholder:text-brand-400 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/15"
                />
                <svg
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>
            <nav aria-label="Navegação móvel" className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition-colors ${
                    isActive(link.to)
                      ? 'bg-brand-950 text-white'
                      : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
