import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { storageService } from '../utils/storage';
import { ALL_CATEGORIES, CATEGORY_META } from '../utils/categories';
import ProductCard from '../components/ProductCard';
import CategoryIcon from '../components/CategoryIcon';
import ProductImage from '../components/ProductImage';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

function SectionHeader({ eyebrow, title, linkTo, linkLabel }: {
  eyebrow: string;
  title: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div className="section-header mb-0">
        <p className="section-title">{eyebrow}</p>
        <h2 className="section-heading">{title}</h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className="mb-1 shrink-0 text-sm font-semibold text-brand-600 transition-colors hover:text-accent-700">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: 'Shopay',
    description:
      'Shopay — vitrine digital de produtos selecionados: perfumes, beleza, casa, acessórios, cursos e muito mais. Descubra ofertas e novidades.',
    path: '/',
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

  const featured = useMemo(
    () => products.filter((p) => p.featured).slice(0, 8),
    [products]
  );

  const deals = useMemo(
    () =>
      products
        .filter((p) => p.affiliateLink && p.affiliateLink.trim() !== '')
        .sort((a, b) => a.price - b.price)
        .slice(0, 8),
    [products]
  );

  const recent = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [products]
  );

  const heroImages = useMemo(
    () =>
      products
        .filter((p) => p.imageUrl)
        .slice(0, 3)
        .map((p) => ({ src: p.imageUrl, name: p.name })),
    [products]
  );

  const categoriesWithProducts = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ALL_CATEGORIES.filter((c) => set.has(c));
  }, [products]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Hero */}
      <section className="hero-panel hero-glow relative overflow-hidden text-white">
        <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent-300">
                <span className="h-px w-8 bg-accent-400/70" />
                vitrine de produtos selecionados
              </span>
              <h1 className="brand-name text-4xl font-bold leading-[1.08] sm:text-5xl md:text-6xl">
                Descubra produtos que combinam com você
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-300 md:text-lg">
                Uma curadoria especial de perfumes, beleza, casa, acessórios e cursos —
                tudo em um só lugar, com ofertas e novidades toda semana.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-400 px-7 py-3.5 font-bold text-brand-950 transition-colors hover:bg-accent-300"
                >
                  Explorar catálogo <span aria-hidden="true">→</span>
                </Link>
                <Link
                  to="/#ofertas"
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-600 px-7 py-3.5 font-bold text-brand-200 transition-colors hover:border-brand-400 hover:text-white"
                >
                  Ver ofertas
                </Link>
              </div>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-brand-700/60 pt-6">
                <div>
                  <dt className="text-2xl font-bold text-white">{products.length}</dt>
                  <dd className="text-xs uppercase tracking-wider text-brand-400">produtos</dd>
                </div>
                <div>
                  <dt className="text-2xl font-bold text-white">{categoriesWithProducts.length}</dt>
                  <dd className="text-xs uppercase tracking-wider text-brand-400">categorias</dd>
                </div>
                <div>
                  <dt className="text-2xl font-bold text-white">{deals.length}</dt>
                  <dd className="text-xs uppercase tracking-wider text-brand-400">ofertas</dd>
                </div>
              </dl>
            </div>

            {heroImages.length > 0 && (
              <div className="relative hidden lg:block" aria-hidden="true">
                <div className="grid grid-cols-2 gap-4">
                  {heroImages.map((img, i) => (
                    <div
                      key={img.src + i}
                      className={`overflow-hidden rounded-2xl border border-brand-700/50 bg-brand-800/60 ${
                        i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'
                      }`}
                    >
                      <ProductImage src={img.src} alt={img.name} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="container mx-auto px-4 py-14 sm:px-6" aria-labelledby="categorias-titulo">
        <SectionHeader eyebrow="Navegue por tema" title="Categorias" linkTo="/catalog" linkLabel="Ver catálogo" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {(categoriesWithProducts.length > 0 ? categoriesWithProducts : ALL_CATEGORIES).map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = products.filter((p) => p.category === cat).length;
            return (
              <Link
                key={cat}
                to={`/catalog?category=${encodeURIComponent(cat)}`}
                className="category-tile group flex flex-col items-center rounded-2xl border border-brand-200 bg-white px-4 py-6 text-center shadow-card"
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${meta.tile}`}>
                  <CategoryIcon icon={meta.icon} className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-brand-900">{meta.label}</span>
                <span className="mt-1 text-xs text-brand-400">
                  {count > 0 ? `${count} produto${count !== 1 ? 's' : ''}` : 'Explore'}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Destaques */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 pb-4 sm:px-6" aria-labelledby="destaques-titulo">
          <SectionHeader eyebrow="Seleção da casa" title="Produtos em destaque" linkTo="/catalog?featured=1" linkLabel="Ver todos" />
          <div className="home-product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Ofertas */}
      {deals.length > 0 && (
        <section id="ofertas" className="mt-16 scroll-mt-24 bg-accent-50/60 py-14" aria-labelledby="ofertas-titulo">
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeader eyebrow="Preços atrativos" title="Ofertas e oportunidades" linkTo="/catalog?sort=price-asc" linkLabel="Ver mais ofertas" />
            <div className="home-product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {deals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Novidades */}
      {recent.length > 0 && (
        <section id="novidades" className="container mx-auto scroll-mt-24 px-4 py-14 sm:px-6" aria-labelledby="novidades-titulo">
          <SectionHeader eyebrow="Acabou de chegar" title="Produtos recentes" linkTo="/catalog?sort=newest" linkLabel="Ver novidades" />
          <div className="home-product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {recent.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <section className="container mx-auto px-4 py-20 text-center sm:px-6">
          <p className="text-lg text-brand-500">Estamos preparando nossa vitrine. Volte em breve!</p>
          <Link to="/catalog" className="btn-secondary mt-6 inline-flex">
            Ir para o catálogo
          </Link>
        </section>
      )}
    </div>
  );
}
