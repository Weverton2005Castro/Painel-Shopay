import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { storageService } from '../utils/storage';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const category = (searchParams.get('category') as Category) || '';
  const search = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sort') as SortOption) || 'name';
  const featuredOnly = searchParams.get('featured') === '1';

  useDocumentMeta({
    title: 'Catálogo de produtos',
    description:
      'Explore o catálogo completo da Shopay: perfumes, beleza, casa e utilidades, acessórios, cursos e muito mais. Filtre por categoria e ordene por preço.',
    path: '/catalog',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await storageService.getProducts();
        setProducts(loaded.filter((p) => p.active));
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Sincroniza o campo de busca com o parâmetro da URL (ex.: vindo do header)
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next, { replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() || null });
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category) {
      result = result.filter((p) => p.category === category);
    }
    if (featuredOnly) {
      result = result.filter((p) => p.featured);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
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
  }, [products, category, search, sortBy, featuredOnly]);

  const hasActiveFilters = !!category || !!search || featuredOnly || sortBy !== 'name';

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const activeCategoryLabel = category ? CATEGORY_META[category]?.label || category : null;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6">
      <div className="section-header">
        <p className="section-title">A vitrine Shopay</p>
        <h1 className="section-heading">
          {activeCategoryLabel ? activeCategoryLabel : 'Catálogo de produtos'}
        </h1>
        <p className="mt-2 text-brand-500">
          {activeCategoryLabel
            ? `Produtos selecionados em ${activeCategoryLabel}.`
            : 'Descubra sua próxima escolha favorita.'}
        </p>
      </div>

      {/* Busca */}
      <form onSubmit={handleSearchSubmit} role="search" className="mb-5">
        <div className="relative">
          <input
            type="text"
            aria-label="Buscar no catálogo"
            placeholder="Buscar por nome, marca ou descrição..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field !pl-11"
          />
          <svg
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400"
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
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateParams({ search: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-400 hover:bg-brand-100 hover:text-brand-700"
              aria-label="Limpar busca"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Chips de categoria */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filtrar por categoria">
        <button
          type="button"
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
          <span className="text-sm font-semibold text-brand-600" aria-live="polite">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </span>
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
      {filteredProducts.length > 0 ? (
        <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="card p-6">
          <EmptyState message="Nenhum produto encontrado com os filtros selecionados." />
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
