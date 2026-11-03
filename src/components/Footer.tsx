export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white mt-16 border-t-4 border-accent-600">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 brand-name text-accent-100">Shopay</h3>
            <p className="text-brand-400 text-sm leading-relaxed max-w-xs">
              Sua vitrine virtual de produtos selecionados com qualidade e exclusividade.
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.18em] font-bold mb-4 text-accent-200">Contato</h3>
            <p className="text-brand-400 text-sm">
              Email: wblanco846@gmail.com
            </p>
            <p className="text-brand-400 text-sm mt-2">
              Afiliado: Weverton De Castro Blanco
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.18em] font-bold mb-4 text-accent-200">Informações</h3>
            <p className="text-brand-400 text-xs leading-relaxed">
              Aviso de Afiliado: Alguns links nesta loja são links de afiliado. Isso significa que podemos receber uma comissão por compras qualificadas realizadas através destes links, sem custo adicional para você.
            </p>
          </div>
        </div>

        <div className="border-t border-brand-700 mt-9 pt-7 text-center text-brand-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Shopay. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs">
            Esta é uma loja de afiliado. Os pedidos e pagamentos são processados diretamente na plataforma de destino.
          </p>
        </div>
      </div>
    </footer>
  );
}
