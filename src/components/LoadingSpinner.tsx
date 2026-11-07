export default function LoadingSpinner() {
  return (
    <div role="status" className="flex items-center justify-center py-12">
      <span className="sr-only">Carregando</span>
      <div className="loading-spinner h-12 w-12" aria-hidden="true" />
    </div>
  );
}
