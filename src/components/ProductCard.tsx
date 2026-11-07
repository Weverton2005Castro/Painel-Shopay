import { Link } from 'react-router-dom';
import { Product } from '../types';
import ProductImage from './ProductImage';
import { getCategoryMeta } from '../utils/categories';
import { formatPrice, partnerUrl } from '../utils/productPresentation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const meta = getCategoryMeta(product.category);
  const purchaseUrl = partnerUrl(product.affiliateLink);

  return (
    <article className="product-card card card-hover group flex h-full flex-col overflow-hidden">
      <Link
        to={`/product/${product.id}`}
        className="product-image relative block aspect-[4/3] overflow-hidden"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-contain p-3 sm:p-5 transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-950/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-200 backdrop-blur">
            Destaque
          </span>
        )}
        {meta && (
          <span className={`absolute bottom-3 left-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur ${meta.chip} bg-white/90`}>
            {product.category}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.brand && (
          <p className="mb-1 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
            {product.brand}
          </p>
        )}
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-brand-950 transition-colors group-hover:text-accent-700 sm:text-base">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="mt-auto pt-3">
          <p className="text-lg font-bold text-brand-950 sm:text-xl">
            {formatPrice(product.price)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              to={`/product/${product.id}`}
              className="btn-secondary flex-1 justify-center !min-h-10 px-2 text-xs sm:text-sm"
            >
              Ver produto
            </Link>
            {purchaseUrl && (
              <a
                href={purchaseUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                aria-label={`Ver ${product.name} na loja parceira`}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-accent-600 px-3 text-white transition-colors hover:bg-accent-700"
                title="Ver na loja parceira"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
