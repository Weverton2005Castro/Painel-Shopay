import { useStorePath, useStore } from '../hooks/useStore';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ALL_CATEGORIES } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

export default function Header() {
  const storePath = useStorePath();
  const store = useStore();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const currentQuery = pathname === storePath('/catalog') ? params.get('search') ?? '' : '';
  const [query, setQuery] = useState(currentQuery);

  useEffect(() => setQuery(currentQuery), [pathname, search, currentQuery]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    navigate(storePath(value ? `/catalog?search=${encodeURIComponent(value)}` : '/catalog'));
  }

  return (
    <header className="shop-header z-50 md:sticky md:top-0">
      <div className="bg-brand-950 px-4 py-1.5 text-center text-[11px] font-semibold text-white">
        {store.name} <span className="mx-2 text-[#defb9e]" aria-hidden="true">•</span> Compra direto com a loja parceira
      </div>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 py-3 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Link to={storePath('/')} className="flex min-w-0 max-w-60 items-center gap-2.5" aria-label={`${store.name}, página inicial`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-700 text-[#defb9e]">
              {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full rounded-xl object-contain bg-white" /> : <CategoryIcon icon="bag" className="h-6 w-6" />}
            </span>
            <span className="brand-name truncate text-xl font-extrabold tracking-tight text-brand-950">{store.name}<span className="text-accent-600">.</span></span>
          </Link>

          <form onSubmit={handleSearch} role="search" aria-label="Busca de produtos" className="col-span-2 row-start-2 flex min-w-0 rounded-xl border border-brand-200 bg-brand-50 p-1 focus-within:border-accent-600 md:col-span-1 md:row-auto">
            <input type="search" aria-label="Buscar produtos" placeholder="Busque produtos, marcas e categorias"
              value={query} onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 rounded-lg bg-transparent px-3 text-sm text-brand-950 placeholder:text-brand-600" />
            <button type="submit" aria-label="Buscar" className="grid h-9 w-11 shrink-0 place-items-center rounded-lg bg-accent-700 text-white hover:bg-accent-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            </button>
          </form>

          <Link to={storePath('/catalog?sort=newest')} className="btn-secondary !min-h-10 !px-3" aria-current={pathname === storePath('/catalog') && params.get('sort') === 'newest' ? 'page' : undefined}>
            <CategoryIcon icon="sparkles" className="h-4 w-4 text-accent-700" /> Novidades
          </Link>
        </div>

        <nav aria-label="Departamentos" className="flex gap-1 overflow-x-auto border-t border-brand-100 py-1.5 text-sm">
          <Link to={storePath('/catalog')} className="department-link font-bold text-accent-700" aria-current={pathname === storePath('/catalog') && !search ? 'page' : undefined}>
            <CategoryIcon icon="grid" className="h-4 w-4" /> Catálogo
          </Link>
          {ALL_CATEGORIES.map((category) => (
            <Link key={category} to={storePath(`/catalog?category=${encodeURIComponent(category)}`)}
              aria-current={pathname === storePath('/catalog') && params.get('category') === category ? 'page' : undefined}
              className="department-link">
              {category}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
