import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../types';
import { storageService } from '../utils/storage';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

type ImageFilter = 'all' | 'with-image' | 'without-image';

interface BatchImportItem {
  productId: string;
  imageUrl: string;
  productName: string;
  status: 'valid' | 'invalid-id' | 'invalid-url' | 'load-error' | 'duplicate';
  error?: string;
}

export default function ManageImages() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ImageFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [editingImage, setEditingImage] = useState<{ id: string; url: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Batch import states
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [preserveExisting, setPreserveExisting] = useState(true);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validatedItems, setValidatedItems] = useState<BatchImportItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    loadProducts();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower)
      );
    }

    if (filter === 'with-image') {
      result = result.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
    } else if (filter === 'without-image') {
      result = result.filter(p => !p.imageUrl || p.imageUrl.trim() === '');
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchTerm, filter, products]);

  const loadProducts = async () => {
    try {
      const loaded = await storageService.getProducts();
      setProducts(loaded);
      setFilteredProducts(loaded);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setLoading(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handlePreviewChange = (url: string) => {
    setPreviewUrl(url);
    setImageError('');

    if (url && isValidUrl(url)) {
      const img = new Image();
      img.onload = () => setImageError('');
      img.onerror = () => setImageError('Esta imagem não pode ser carregada. Verifique a URL.');
      img.src = url;
    }
  };

  const handleSaveImage = async (productId: string) => {
    if (!previewUrl.trim()) {
      setError('Por favor, insira uma URL de imagem válida.');
      return;
    }

    if (!isValidUrl(previewUrl)) {
      setError('URL inválida. Insira uma URL válida começando com http:// ou https://');
      return;
    }

    if (imageError) {
      setError('Não é possível salvar uma imagem que não carrega corretamente.');
      return;
    }

    setSaving(productId);
    setError('');
    setSuccess('');

    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        setError('Produto não encontrado.');
        setSaving(null);
        return;
      }

      const updatedProduct: Product = {
        ...product,
        imageUrl: previewUrl,
        updatedAt: new Date().toISOString()
      };

      await storageService.updateProduct(productId, updatedProduct);
      await loadProducts();
      setSuccess('Imagem atualizada com sucesso!');
      setEditingImage(null);
      setPreviewUrl('');
      setImageError('');
    } catch (err) {
      setError('Erro ao salvar imagem. Tente novamente.');
    } finally {
      setSaving(null);
    }
  };

  const handleEditImage = (product: Product) => {
    setEditingImage({ id: product.id, url: product.imageUrl });
    setPreviewUrl(product.imageUrl);
    setImageError('');
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingImage(null);
    setPreviewUrl('');
    setImageError('');
    setError('');
  };

  const hasValidImage = (product: Product): boolean => {
    return Boolean(product.imageUrl && product.imageUrl.trim() !== '' && isValidUrl(product.imageUrl));
  };

  const getImageStatus = (product: Product): { status: 'valid' | 'invalid' | 'empty'; label: string; color: string } => {
    if (!product.imageUrl || product.imageUrl.trim() === '') {
      return { status: 'empty', label: 'Sem imagem', color: 'bg-gray-100 text-gray-600' };
    }
    if (isValidUrl(product.imageUrl)) {
      return { status: 'valid', label: 'Com imagem', color: 'bg-green-100 text-green-700' };
    }
    return { status: 'invalid', label: 'URL inválida', color: 'bg-red-100 text-red-700' };
  };

  const handleValidateBatch = async () => {
    if (!batchText.trim()) {
      setError('Por favor, insira pelo menos uma linha com ID e URL.');
      return;
    }

    setValidating(true);
    setError('');
    setValidatedItems([]);

    const lines = batchText.split('\n').filter(line => line.trim());
    const seenIds = new Set<string>();
    const validated: BatchImportItem[] = [];

    for (const line of lines) {
      const parts = line.split(';').map(p => p.trim());
      if (parts.length < 2) continue;

      const [productId, imageUrl] = parts;

      // Check for duplicate IDs
      if (seenIds.has(productId)) {
        validated.push({
          productId,
          imageUrl,
          productName: 'Duplicado',
          status: 'duplicate',
          error: 'ID duplicado na importação'
        });
        continue;
      }
      seenIds.add(productId);

      // Check if product exists
      const product = products.find(p => p.id === productId);
      if (!product) {
        validated.push({
          productId,
          imageUrl,
          productName: 'Não encontrado',
          status: 'invalid-id',
          error: 'Produto não encontrado'
        });
        continue;
      }

      // Check URL validity
      if (!isValidUrl(imageUrl)) {
        validated.push({
          productId,
          imageUrl,
          productName: product.name,
          status: 'invalid-url',
          error: 'URL inválida'
        });
        continue;
      }

      // Check if image loads
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Imagem não carrega'));
          img.src = imageUrl;
          setTimeout(() => reject(new Error('Timeout')), 5000);
        });

        validated.push({
          productId,
          imageUrl,
          productName: product.name,
          status: 'valid'
        });
      } catch {
        validated.push({
          productId,
          imageUrl,
          productName: product.name,
          status: 'load-error',
          error: 'Imagem não carrega ou timeout'
        });
      }
    }

    setValidatedItems(validated);
    setValidating(false);
  };

  const handleImportBatch = async () => {
    const validItems = validatedItems.filter(item => item.status === 'valid');
    if (validItems.length === 0) {
      setError('Nenhum item válido para importar.');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    let saved = 0;
    let ignored = 0;
    let errors = 0;

    for (const item of validItems) {
      try {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          errors++;
          continue;
        }

        // Check if should preserve existing image
        if (preserveExisting && product.imageUrl && product.imageUrl.trim() !== '') {
          ignored++;
          continue;
        }

        const updatedProduct: Product = {
          ...product,
          imageUrl: item.imageUrl,
          updatedAt: new Date().toISOString()
        };

        await storageService.updateProduct(item.productId, updatedProduct);
        saved++;
      } catch {
        errors++;
      }
    }

    await loadProducts();
    setImporting(false);
    setBatchText('');
    setValidatedItems([]);
    setShowBatchImport(false);

    setSuccess(`Importação concluída! ${saved} imagens salvas, ${ignored} ignoradas, ${errors} erros.`);
  };

  const handleCloseBatchImport = () => {
    setShowBatchImport(false);
    setBatchText('');
    setValidatedItems([]);
    setError('');
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 mb-2 inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Painel
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Imagens dos Produtos</h1>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar produto
            </label>
            <input
              type="text"
              placeholder="Nome do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtro de imagens
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ImageFilter)}
              className="input-field"
            >
              <option value="all">Todos os produtos</option>
              <option value="with-image">Com imagem</option>
              <option value="without-image">Sem imagem</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resultados
            </label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowBatchImport(true)}
              className="btn-primary w-full"
            >
              Importar em Lote
            </button>
          </div>
        </div>
      </div>

      {currentProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map((product) => {
              const imageStatus = getImageStatus(product);
              const isEditing = editingImage?.id === product.id;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    {hasValidImage(product) ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${imageStatus.color}`}>
                      {imageStatus.label}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.category}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mb-3">
                      R$ {product.price.toFixed(2)}
                    </p>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL da imagem
                          </label>
                          <input
                            type="url"
                            value={previewUrl}
                            onChange={(e) => handlePreviewChange(e.target.value)}
                            className="input-field text-sm"
                            placeholder="https://..."
                          />
                        </div>

                        {previewUrl && (
                          <div className="relative h-32 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-full object-contain"
                              onError={() => setImageError('Esta imagem não pode ser carregada.')}
                            />
                          </div>
                        )}

                        {imageError && (
                          <p className="text-xs text-red-600">{imageError}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveImage(product.id)}
                            disabled={saving === product.id}
                            className="btn-primary flex-1 text-sm py-2"
                          >
                            {saving === product.id ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn-secondary text-sm py-2"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditImage(product)}
                        className="btn-primary w-full text-sm"
                      >
                        {hasValidImage(product) ? 'Alterar imagem' : 'Adicionar imagem'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState message="Nenhum produto encontrado com os filtros selecionados." />
      )}

      <Modal
        isOpen={showBatchImport}
        onClose={handleCloseBatchImport}
        title="Importar Imagens em Lote"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cole as associações (ID;URL) - uma por linha
            </label>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              className="input-field"
              rows={10}
              placeholder="shopay-1;https://exemplo.com/imagem1.jpg&#10;shopay-2;https://exemplo.com/imagem2.png&#10;shopay-3;https://exemplo.com/imagem3.webp"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: ID_DO_PRODUTO;URL_DA_IMAGEM (separados por ponto e vírgula)
            </p>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preserveExisting}
              onChange={(e) => setPreserveExisting(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Preservar imagens existentes (não substituir produtos que já têm imagem)
            </span>
          </label>

          {validatedItems.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Prévia da Validação ({validatedItems.length} itens)
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {validatedItems.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      item.status === 'valid'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          ID: {item.productId}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.imageUrl}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.status === 'valid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status === 'valid' ? 'Válido' : item.error}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Resumo:</strong> {validatedItems.filter(i => i.status === 'valid').length} válidos,{' '}
                  {validatedItems.filter(i => i.status !== 'valid').length} com erro
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {validatedItems.length === 0 ? (
              <>
                <button
                  onClick={handleValidateBatch}
                  disabled={validating}
                  className="btn-primary flex-1"
                >
                  {validating ? 'Validando...' : 'Validar Importação'}
                </button>
                <button onClick={handleCloseBatchImport} className="btn-secondary">
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleImportBatch}
                  disabled={importing}
                  className="btn-primary flex-1"
                >
                  {importing ? 'Importando...' : 'Importar Válidas'}
                </button>
                <button
                  onClick={() => setValidatedItems([])}
                  className="btn-secondary"
                >
                  Corrigir
                </button>
                <button onClick={handleCloseBatchImport} className="btn-secondary">
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
