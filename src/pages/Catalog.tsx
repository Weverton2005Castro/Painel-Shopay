import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category, FilterOptions } from '../types';
import { storageService } from '../utils/storage';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterOptions>({
    category: (searchParams.get('category') as Category) || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: 'name'
  });

  const categories: Category[] = ['Perfumes', 'Casa e Utilidades', 'Beleza', 'Acessórios', 'Cursos', 'Alimentos', 'Papelaria', 'Serviços', 'Cosméticos', 'Outros'];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loadedProducts = await storageService.getProducts();
        const activeProducts = loadedProducts.filter(p => p.active);
        setProducts(activeProducts);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(result);
  }, [products, filters]);

  const handleCategoryChange = (category: Category | '') => {
    setFilters(prev => ({
      ...prev,
      category: category || undefined
    }));
  };

  const handleSortChange = (sortBy: 'name' | 'price-asc' | 'price-desc') => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8"><p className="text-xs uppercase tracking-[.2em] text-amber-800 font-bold mb-2">A vitrine Shopay</p><h1 className="text-4xl font-bold text-stone-900 brand-name">Catálogo de produtos</h1><p className="text-stone-500 mt-2">Descubra sua próxima escolha favorita.</p></div>

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5 md:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleCategoryChange(e.target.value as Category)}
              className="input-field"
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="input-field"
            >
              <option value="name">Nome (A-Z)</option>
              <option value="price-asc">Preço (menor para maior)</option>
              <option value="price-desc">Preço (maior para menor)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resultados
            </label>
            <div className="px-4 py-3 bg-stone-100 rounded-xl text-stone-700 font-semibold">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => window.location.href = `/product/${product.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="Nenhum produto encontrado com os filtros selecionados." />
      )}
    </div>
  );
}
