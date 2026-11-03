import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const hasValidLink = product.affiliateLink && product.affiliateLink.trim() !== '';

  return (
    <div className="card card-hover product-card group cursor-pointer">
      <div onClick={onClick} className="product-image relative h-52 overflow-hidden sm:h-56">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.featured && (
          <span className="absolute top-3 right-3 bg-brand-950/90 text-accent-100 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full backdrop-blur">
            Destaque
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-700">
            {product.category}
          </span>
          {product.brand && (
            <span className="max-w-full truncate text-xs font-medium text-brand-500">
              {product.brand}
            </span>
          )}
        </div>
        <h3
          onClick={onClick}
          className="text-lg font-bold text-brand-950 mt-2 group-hover:text-accent-700 transition-colors leading-snug"
        >
          {product.name}
        </h3>
        <p className="text-brand-500 text-sm mt-2 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-brand-950">
              R$ {product.price.toFixed(2)}
            </span>
            {product.commission && product.commission > 0 && (
              <span className="block text-xs text-success-700 mt-1">
                Comissão: R$ {product.commission.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {hasValidLink ? (
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-primary w-full mt-4 text-center block"
          >
            Comprar agora
          </a>
        ) : (
          <button
            disabled
            className="w-full mt-4 px-4 py-3 bg-brand-100 text-brand-400 rounded-xl cursor-not-allowed text-sm font-semibold"
          >
            Link não disponível
          </button>
        )}
      </div>
    </div>
  );
}
