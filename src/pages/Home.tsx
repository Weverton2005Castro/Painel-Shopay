import { Link } from 'react-router-dom';
import { ALL_CATEGORIES, CATEGORY_META } from '../utils/categories';
import { partnerUrl } from '../utils/productPresentation';
import ProductCard from '../components/ProductCard';
import CategoryIcon from '../components/CategoryIcon';
import CatalogError from '../components/CatalogError';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useStorefront } from '../hooks/useStorefront';

export default function Home() {
  const { products, status, retry } = useStorefront();

  useDocumentMeta({
    title: 'Shopay',
    description: 'Explore a curadoria Shopay de perfumes, beleza, casa, acessórios e mais. Encontre produtos e confira os preços nas lojas parceiras.',
    path: '/',
  });

  const featured = products.filter((product) => product.featured);
  const available = products.filter((product) => partnerUrl(product.affiliateLink));
  const collections = [
    {
      title: 'Destaques da Shopay', label: 'Seleção da casa', to: '/catalog?featured=1',
      products: featured.slice(0, 4),
    },
    {
      title: 'Novidades na vitrine', label: 'Adicionados recentemente', to: '/catalog?sort=newest',
      products: products.slice(0, 8),
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6">
      <section className="store-hero mt-5 grid items-center overflow-hidden rounded-[1.75rem] md:grid-cols-[1.25fr_1fr]">
        <div className="relative z-10 px-6 pt-8 sm:px-8 md:py-10 lg:px-14">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-white">
            <span className="h-2 w-2 rounded-full bg-[#defb9e]" aria-hidden="true" />
            A curadoria da Shopay
          </p>
          <h1 className="max-w-xl text-[2.1rem] font-extrabold leading-[1.03] tracking-[-0.055em] text-white sm:text-[2.6rem] lg:text-6xl">
            Bons achados para <span className="text-[#defb9e]">o seu dia a dia.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#e2daf8] sm:text-base">
            Explore beleza, casa, acessórios e muito mais. Descubra produtos selecionados e confira as condições nas lojas parceiras.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/catalog" className="btn-primary !bg-[#defb9e] !text-[#202d1b] hover:!bg-white">
              Explorar catálogo <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/catalog?sort=newest" className="btn-secondary !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
              Ver novidades
            </Link>
          </div>
        </div>
        <img className="mx-auto w-full max-w-[31rem] max-md:max-h-48" src="/shopay-curadoria.svg" width="560" height="420" alt="" />
      </section>

      <div className="store-benefits grid divide-y divide-brand-200 rounded-2xl border border-brand-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          ['sparkles', 'Curadoria Shopay', 'Produtos reunidos em um só lugar'],
          ['grid', 'Encontre por categoria', 'Explore o catálogo no seu ritmo'],
          ['shopping-bag', 'Compra com o parceiro', 'Preço final e entrega na loja de destino'],
        ].map(([icon, title, description]) => (
          <div key={title} className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
            <CategoryIcon icon={icon} className="h-6 w-6 shrink-0 text-accent-700" />
            <div>
              <p className="text-sm font-bold">{title}</p>
              <p className="text-xs text-brand-600">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="py-10 sm:py-12" aria-labelledby="categorias-titulo">
        <p className="section-title">Explore por interesse</p>
        <h2 id="categorias-titulo" className="section-heading mb-5">Compre por categoria</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3 lg:grid-cols-10">
          {ALL_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            return (
              <Link key={category} to={`/catalog?category=${encodeURIComponent(category)}`}
                className="category-tile group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-white px-1 py-3 text-center text-xs font-bold">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${meta.tile}`}>
                  <CategoryIcon icon={meta.icon} className="h-5 w-5" />
                </span>
                {meta.label}
              </Link>
            );
          })}
        </div>
      </section>

      {status === 'loading' && <LoadingSpinner />}
      {status === 'error' && <CatalogError retry={retry} />}
      {status === 'ready' && products.length === 0 && (
        <p className="card px-6 py-10 text-center text-brand-600">Estamos preparando nossa seleção de produtos. Volte em breve.</p>
      )}
      {collections.filter((collection) => collection.products.length > 0).map((collection) => (
        <section key={collection.to} className="mb-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-title">{collection.label}</p>
              <h2 className="section-heading">{collection.title}</h2>
            </div>
            <Link to={collection.to} className="text-sm font-bold text-accent-700 hover:underline">Ver todos <span aria-hidden="true">→</span></Link>
          </div>
          <div className="home-product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {collection.products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      ))}
      {available.length > 0 && (
        <Link to="/catalog?partner=1&sort=price-asc" className="card flex items-center justify-between gap-4 p-5 font-bold text-accent-800 hover:border-accent-300">
          Ver produtos com link de compra <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
