export default function CatalogError({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="card mx-auto my-12 max-w-xl p-8 text-center">
      <h2 className="text-xl font-bold">Não foi possível carregar os produtos</h2>
      <p className="mt-2 text-sm text-brand-600">Tente novamente em instantes.</p>
      <button type="button" className="btn-primary mt-5" onClick={retry}>Tentar novamente</button>
    </div>
  );
}
