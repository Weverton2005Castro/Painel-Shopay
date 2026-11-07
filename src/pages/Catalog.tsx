import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Category } from '../types';
import { useStorefront } from '../hooks/useStorefront';
import CatalogError from '../components/CatalogError';
import { partnerUrl, searchKey } from '../utils/productPresentation';
import { ALL_CATEGORIES, CATEGORY_META } from '../utils/categories';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryIcon from '../components/CategoryIcon';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'newest', label: 'Mais recentes' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, status, retry } = useStorefront();
  const requestedCategory = searchParams.get('category') as Category;
  const category = ALL_CATEGORIES.includes(requestedCategory) ? requestedCategory : '';
  const search = searchParams.get('search')?.trim() || '';
  const sortBy = SORT_OPTIONS.find(({ value }) => value === searchParams.get('sort'))?.value ?? 'name';
  const featuredOnly = searchParams.get('featured') === '1';
  const partnerOnly = searchParams.get('partner') === '1';

  useDocumentMeta({
    title: 'Catálogo de produtos',
    description:
      'Explore o catálogo completo da Shopay: perfumes, beleza, casa e utilidades, acessórios, cursos e muito mais. Filtre por categoria e ordene por preço.',
    path: '/catalog',
  });

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category) {
      result = result.filter((p) => p.category === category);
    }
    if (featuredOnly) {
      result = result.filter((p) => p.featured);
    }
    if (partnerOnly) {
      result = result.filter((product) => partnerUrl(product.affiliateLink));
    }
    if (search) {
      const terms = searchKey(search).split(/\s+/);
      result = result.filter((product) => {
        const index = searchKey([product.name, product.brand, product.category, product.description].join(' '));
        return terms.every((term) => index.includes(term));
      });
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name':
      default:
        result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        break;
    }

    return result;
  }, [products, category, search, sortBy, featuredOnly, partnerOnly]);

  const hasActiveFilters = !!category || !!search || featuredOnly || partnerOnly || sortBy !== 'name';

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeCategoryLabel = category ? CATEGORY_META[category]?.label || category : null;

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6">
      <div className="catalog-intro mb-6 rounded-[1.5rem] border border-accent-100 px-5 py-7 sm:px-8">
        <p className="section-title">A vitrine Shopay</p>
        <h1 className="section-heading break-words">
          {search ? `Resultados para “${search}”` : activeCategoryLabel || 'Catálogo de produtos'}
        </h1>
        <p className="mt-2 text-brand-500">
          {activeCategoryLabel
            ? `Produtos selecionados em ${activeCategoryLabel}.`
            : 'Descubra sua próxima escolha favorita.'}
        </p>
      </div>

      {/* Chips de categoria */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filtrar por categoria">
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => updateParams({ category: null })}
          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
            !category
              ? 'border-brand-950 bg-brand-950 text-white'
              : 'border-brand-200 bg-white text-brand-600 hover:border-brand-300 hover:bg-brand-50'
          }`}
        >
          Todas
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={active}
              onClick={() => updateParams({ category: active ? null : cat })}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                active
                  ? 'border-brand-950 bg-brand-950 text-white'
                  : `${meta.chip} hover:brightness-95`
              }`}
            >
              <CategoryIcon icon={meta.icon} className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Barra de filtros */}
      <div className="card mb-8 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-700">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => updateParams({ featured: e.target.checked ? '1' : null })}
              className="h-4 w-4 rounded border-brand-300 accent-brand-900"
            />
            Apenas destaques
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-700">
            <input type="checkbox" checked={partnerOnly} onChange={(event) => updateParams({ partner: event.target.checked ? '1' : null })}
              className="h-4 w-4 accent-accent-700" />
            Com link de compra
          </label>
          {status === 'ready' && <span className="text-sm font-semibold text-brand-600" aria-live="polite">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </span>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="catalog-sort" className="text-sm font-semibold text-brand-600">
            Ordenar:
          </label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => updateParams({ sort: e.target.value === 'name' ? null : e.target.value })}
            className="input-field !min-h-10 min-w-0 flex-1 px-3 py-2 text-sm sm:!w-auto sm:flex-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="btn-ghost btn-sm">
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {status === 'loading' ? <LoadingSpinner /> : status === 'error' ? <CatalogError retry={retry} /> : filteredProducts.length > 0 ? (
        <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="card p-6">
          <EmptyState message={hasActiveFilters ? "Nenhum produto corresponde aos filtros selecionados." : "Ainda não há produtos publicados no catálogo."} />
          {hasActiveFilters && (
            <div className="-mt-6 pb-4 text-center">
              <button type="button" onClick={clearFilters} className="btn-secondary">
                Limpar filtros e ver todos os produtos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
