import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { storageService } from '../utils/storage';
import EmptyState from '../components/EmptyState';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await storageService.getProducts();
        const found = products.find(p => p.id === id);
        setProduct(found || null);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState message="Produto não encontrado." />
        <button
          onClick={() => navigate('/catalog')}
          className="btn-primary mt-4"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const hasValidLink = product.affiliateLink && product.affiliateLink.trim() !== '';

  return (
    <div className="container mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-brand-600 hover:text-accent-700 mb-6 inline-flex items-center gap-2 font-semibold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <div className="card rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-5 md:p-10">
          <div className="product-image rounded-2xl overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-[22rem] md:h-[34rem] object-cover"
            />
          </div>

          <div>
            <span className="text-xs text-accent-700 font-bold uppercase tracking-[0.16em]">
              {product.category}
            </span>
            {product.featured && (
              <span className="ml-2 badge badge-warning">
                Destaque
              </span>
            )}
            {product.brand && (
              <span className="ml-2 badge badge-neutral">
                {product.brand}
              </span>
            )}
            <h1 className="text-4xl font-bold text-brand-950 mt-3 mb-5 brand-name">
              {product.name}
            </h1>
            <div className="mb-6">
              <p className="text-3xl font-bold text-brand-950">
                R$ {product.price.toFixed(2)}
              </p>
              {product.commission && product.commission > 0 && (
                <p className="text-sm text-success-700 mt-2">
                  Comissão: R$ {product.commission.toFixed(2)}
                </p>
              )}
            </div>
            <p className="text-brand-600 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            {hasValidLink ? (
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-center block text-lg py-4"
              >
                Comprar agora
              </a>
            ) : (
              <div className="alert alert-warning mb-4">
                <p className="text-sm">
                  ⚠️ Este produto ainda não possui link de afiliado configurado.
                  Entre em contato com o administrador para mais informações.
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-brand-200">
              <h3 className="font-semibold text-brand-800 mb-2">Informações adicionais</h3>
              <ul className="text-sm text-brand-600 space-y-1">
                <li>Categoria: {product.category}</li>
                <li>ID do produto: {product.id}</li>
                <li>
                  Atualizado em: {new Date(product.updatedAt).toLocaleDateString('pt-BR')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
