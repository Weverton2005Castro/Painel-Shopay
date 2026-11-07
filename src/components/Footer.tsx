import { Link } from 'react-router-dom';
import { ALL_CATEGORIES } from '../utils/categories';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-200 bg-brand-950 text-white">
      <div className="container mx-auto px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600">
                <span className="brand-name text-xl font-semibold text-white">S</span>
              </div>
              <span className="brand-name text-xl font-bold">Shopay</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-400">
              Descubra produtos selecionados para o seu dia a dia e confira as condições nas lojas parceiras.
            </p>
          </div>

          <nav aria-label="Categorias">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-accent-300">
              Categorias
            </h3>
            <ul className="space-y-2.5">
              {ALL_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/catalog?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-brand-400 transition-colors hover:text-white"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Navegação">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-accent-300">
              Navegação
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-brand-400 transition-colors hover:text-white">
                  Página inicial
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-sm text-brand-400 transition-colors hover:text-white">
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link to="/catalog?partner=1&sort=price-asc" className="text-sm text-brand-400 transition-colors hover:text-white">
                  Com link de compra
                </Link>
              </li>
              <li>
                <Link to="/catalog?sort=newest" className="text-sm text-brand-400 transition-colors hover:text-white">
                  Novidades
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-accent-300">
              Transparência
            </h3>
            <p className="text-sm leading-relaxed text-brand-400">
              Esta é uma loja de afiliados. Alguns links são de afiliado: podemos receber uma
              comissão por compras qualificadas, sem custo adicional para você.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-400">
              Pedidos e pagamentos são processados diretamente na plataforma de destino.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-800 pt-7 sm:flex-row">
          <p className="text-sm text-brand-300">
            © {new Date().getFullYear()} Shopay. Todos os direitos reservados.
          </p>
          <p className="text-xs text-brand-300">
            Afiliado: Weverton De Castro Blanco · wblanco846@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}
