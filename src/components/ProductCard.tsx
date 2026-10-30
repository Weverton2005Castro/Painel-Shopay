import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const hasValidLink = product.affiliateLink && product.affiliateLink.trim() !== '';

  return (
    <div className="card product-card group cursor-pointer">
      <div onClick={onClick} className="product-image relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.featured && (
          <span className="absolute top-3 right-3 bg-stone-900/90 text-amber-100 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full backdrop-blur">
            Destaque
          </span>
        )}
      </div>

        <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-[.15em]">
            {product.category}
          </span>
          {product.brand && (
            <span className="text-xs text-stone-500 font-medium">
              {product.brand}
            </span>
          )}
        </div>
        <h3
          onClick={onClick}
          className="text-lg font-bold text-stone-900 mt-2 group-hover:text-amber-800 transition-colors leading-snug"
        >
          {product.name}
        </h3>
        <p className="text-stone-500 text-sm mt-2 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-stone-900">
              R$ {product.price.toFixed(2)}
            </span>
            {product.commission && product.commission > 0 && (
              <span className="block text-xs text-emerald-700 mt-1">
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
            className="w-full mt-4 px-4 py-3 bg-stone-100 text-stone-400 rounded-xl cursor-not-allowed text-sm font-semibold"
          >
            Link não disponível
          </button>
        )}
      </div>
    </div>
  );
}
