import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function NotFound() {
  useDocumentMeta({
    title: 'Página não encontrada',
    description: 'A página que você procura não existe ou foi movida.',
    path: '/404',
    noindex: true,
  });

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="brand-name text-7xl font-bold text-accent-600">404</p>
      <h1 className="brand-name mt-4 text-3xl font-bold text-brand-950">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-brand-500">
        O endereço que você acessou não existe ou foi movido. Que tal explorar nosso catálogo?
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Voltar ao início</Link>
        <Link to="/catalog" className="btn-secondary">Ver catálogo</Link>
      </div>
    </div>
  );
}
