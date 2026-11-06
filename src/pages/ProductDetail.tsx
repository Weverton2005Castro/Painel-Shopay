import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Product } from '../types';
import { storageService } from '../utils/storage';
import { getCategoryMeta } from '../utils/categories';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import JsonLd from '../components/JsonLd';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const SITE_URL = 'https://painel-shopay.vercel.app';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const products = await storageService.getProducts();
        const found = products.find((p) => p.id === id && p.active) || null;
        setProduct(found);
        setNotFound(!found);
        if (found) {
          setRelated(
            products
              .filter((p) => p.active && p.id !== found.id && p.category === found.category)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const meta = product ? getCategoryMeta(product.category) : null;

  useDocumentMeta({
    title: product ? product.name : 'Produto não encontrado',
    description: product
      ? `${product.name}${product.brand ? ` — ${product.brand}` : ''}. ${product.description} Compre na Shopay.`
      : 'Produto não encontrado na Shopay.',
    path: product ? `/product/${product.id}` : '/404',
    image: product?.imageUrl,
    type: 'product',
    noindex: !product,
  });

  const jsonLd = useMemo(() => {
    if (!product) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.imageUrl || undefined,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      category: product.category,
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/product/${product.id}`,
        priceCurrency: 'BRL',
        price: product.price.toFixed(2),
        availability: 'https://schema.org/InStock',
      },
    };
  }, [product]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (notFound || !product) {
    return (
      <div className="container mx-auto px-4 py-20 sm:px-6">
        <EmptyState message="Produto não encontrado ou indisponível no momento." />
        <div className="mt-6 text-center">
          <Link to="/catalog" className="btn-primary">
            Ver catálogo completo
          </Link>
        </div>
      </div>
    );
  }

  const hasValidLink = !!product.affiliateLink && product.affiliateLink.trim() !== '';

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      {jsonLd && <JsonLd data={jsonLd} id="product-json-ld" />}

      {/* Breadcrumb */}
      <nav aria-label="Trilha de navegação" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-brand-500">
        <Link to="/" className="transition-colors hover:text-brand-900">Início</Link>
        <span aria-hidden="true">/</span>
        <Link to="/catalog" className="transition-colors hover:text-brand-900">Catálogo</Link>
        <span aria-hidden="true">/</span>
        <span className="max-w-[16rem] truncate font-semibold text-brand-800 sm:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          {/* Imagem */}
          <div className="product-image relative aspect-[4/3] md:aspect-auto md:min-h-[28rem]">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {product.featured && (
              <span className="absolute left-4 top-4 rounded-full bg-brand-950/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent-200 backdrop-blur">
                Destaque
              </span>
            )}
          </div>

          {/* Informações */}
          <div className="flex flex-col p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${meta?.chip || 'bg-brand-100 text-brand-700 border-brand-200'}`}>
                {meta && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
                {product.category}
              </span>
              {product.brand && (
                <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                  {product.brand}
                </span>
              )}
            </div>

            <h1 className="brand-name mt-4 text-3xl font-bold leading-tight text-brand-950 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5">
              <p className="text-3xl font-bold text-brand-950 sm:text-4xl">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
              <p className="mt-1 text-xs text-brand-400">Preço em reais (BRL)</p>
            </div>

            <p className="mt-6 text-base leading-relaxed text-brand-600">{product.description}</p>

            <div className="mt-auto pt-8">
              {hasValidLink ? (
                <>
                  <a
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent btn-lg w-full justify-center text-base"
                  >
                    Comprar agora
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p className="mt-3 text-center text-xs text-brand-400">
                    Você será direcionado à plataforma parceira para concluir a compra.
                  </p>
                </>
              ) : (
                <div className="alert alert-warning">
                  <p className="text-sm font-semibold">
                    Este produto ainda não possui link de compra disponível.
                  </p>
                  <p className="mt-1 text-xs">
                    Volte em breve ou explore outros produtos do catálogo.
                  </p>
                </div>
              )}

              <Link to="/catalog" className="btn-ghost mt-4 w-full justify-center">
                ← Continuar explorando
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos relacionados */}
      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="relacionados-titulo">
          <div className="section-header">
            <p className="section-title">Você também pode gostar</p>
            <h2 id="relacionados-titulo" className="section-heading">
              Mais de {product.category}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Transparência */}
      <aside className="mt-14 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 text-sm leading-relaxed text-brand-500">
        <p>
          <strong className="text-brand-700">Transparência:</strong> a Shopay é uma loja de
          afiliados. Alguns links desta página são links de afiliado — podemos receber uma
          comissão por compras qualificadas realizadas através deles, sem custo adicional
          para você. O pedido, o pagamento e o atendimento são processados diretamente pela
          plataforma de destino.
        </p>
      </aside>
    </div>
  );
}
