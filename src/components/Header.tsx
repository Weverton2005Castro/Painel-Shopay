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
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 bg-stone-900 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-amber-200 font-semibold text-2xl brand-name">S</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-stone-900 brand-name">Shopay</span>
              <span className="block text-[10px] uppercase tracking-[.18em] text-stone-500">curadoria especial</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 border border-stone-200 rounded-xl bg-stone-50/70 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 outline-none transition-all placeholder:text-stone-400"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400"
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

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors font-semibold"
            >
              Início
            </Link>
            <Link
              to="/catalog"
              className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors font-semibold"
            >
              Catálogo
            </Link>
            {/* <Link
              to="/admin"
              className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors font-semibold"
            >
              Admin
            </Link> */}
          </nav>
        </div>
      </div>
    </header>
  );
}
