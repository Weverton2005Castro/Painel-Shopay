import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../types';
import { storageService } from '../utils/storage';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories: Category[] = ['Perfumes', 'Casa e Utilidades', 'Beleza', 'Acessórios', 'Cursos', 'Alimentos', 'Papelaria', 'Serviços', 'Cosméticos', 'Outros'];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await storageService.getProducts();
        const featured = products.filter(p => p.featured && p.active).slice(0, 8);
        setFeaturedProducts(featured);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div>
      <section className="hero-panel hero-glow text-accent-500">
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 text-brand-200 text-xs uppercase tracking-[0.24em] font-semibold mb-5">
              <span className="w-8 h-px bg-accent-300/70" />
              escolhas que inspiram
              <span className="w-8 h-px bg-accent-300/70" />
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-[1.08] brand-name text-white">
              Descubra produtos que combinam com você
            </h1>
            <p className="text-base md:text-lg mb-9 text-brand-300 max-w-xl mx-auto leading-relaxed">
              Uma seleção especial de qualidade, elegância e boas descobertas para o seu dia a dia.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-300 px-7 py-3.5 font-bold text-brand-950 transition-colors hover:bg-accent-200"
            >
              Explorar catálogo <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="section-header">
          <p className="section-title">Encontre o que procura</p>
          <h2 className="section-heading">Explore por categoria</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/catalog?category=${encodeURIComponent(category)}`}
              className="category-tile bg-white p-5 sm:p-6 rounded-2xl border border-brand-200/80 shadow-card text-center"
            >
              <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-accent-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <span className="font-semibold text-sm text-brand-800">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-7">
          <div className="section-header mb-0">
            <p className="section-title">Seleção da casa</p>
            <h2 className="section-heading">Destaques</h2>
          </div>
          <Link to="/catalog" className="text-brand-700 hover:text-accent-700 font-semibold text-sm mb-1">
            Ver todos →
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => window.location.href = `/product/${product.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-brand-500">
            Nenhum produto em destaque no momento.
          </div>
        )}
      </section>
    </div>
  );
}
