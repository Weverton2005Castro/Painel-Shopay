import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="shop-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 bg-brand-950 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-shadow">
              <span className="text-accent-200 font-semibold text-2xl brand-name">S</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-brand-950 brand-name">Shopay</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-500">curadoria especial</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} role="search" className="w-full flex-1 md:max-w-xl">
            <div className="relative">
              <input
                type="text"
                aria-label="Buscar produtos"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 border border-brand-200 rounded-xl bg-brand-50/70 focus:ring-2 focus:ring-brand-600/30 focus:border-brand-700 outline-none transition-all placeholder:text-brand-400"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

          <nav aria-label="Navegação principal" className="flex items-center justify-center gap-1 border-t border-brand-100 pt-2 md:justify-end md:border-0 md:pt-0">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm text-brand-600 hover:text-brand-950 hover:bg-brand-100 transition-colors font-semibold"
            >
              Início
            </Link>
            <Link
              to="/catalog"
              className="px-3 py-2 rounded-lg text-sm text-brand-600 hover:text-brand-950 hover:bg-brand-100 transition-colors font-semibold"
            >
              Catálogo
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
