import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Product, ProductFormData, Category } from '../types';
import { storageService } from '../utils/storage';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNoLink, setFilterNoLink] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: 'Perfumes',
    imageUrl: '',
    affiliateLink: '',
    featured: false,
    active: true,
    brand: '',
    commission: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const categories: Category[] = ['Perfumes', 'Casa e Utilidades', 'Beleza', 'Acessórios', 'Cursos', 'Alimentos', 'Papelaria', 'Serviços', 'Cosméticos', 'Outros'];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    loadProducts();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterNoLink) {
      filtered = filtered.filter(p => !p.affiliateLink || p.affiliateLink.trim() === '');
    }

    setFilteredProducts(filtered);
  }, [searchTerm, products, filterNoLink]);

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

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        affiliateLink: product.affiliateLink,
        featured: product.featured,
        active: product.active,
        brand: product.brand || '',
        commission: product.commission || 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Perfumes',
        imageUrl: '',
        affiliateLink: '',
        featured: false,
        active: true,
        brand: '',
        commission: 0
      });
    }
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.description.trim() || !formData.imageUrl.trim()) {
      setError('Nome, descrição e imagem são obrigatórios.');
      return;
    }

    if (formData.price <= 0) {
      setError('O preço deve ser maior que zero.');
      return;
    }

    if (formData.affiliateLink.trim() && !isValidUrl(formData.affiliateLink)) {
      setError('Link de afiliado inválido.');
      return;
    }

    if (!isValidUrl(formData.imageUrl)) {
      setError('URL da imagem inválida.');
      return;
    }

    const now = new Date().toISOString();

    try {
      if (editingProduct) {
        const updated: Product = {
          ...editingProduct,
          ...formData,
          updatedAt: now
        };
        await storageService.updateProduct(editingProduct.id, updated);
        setSuccess('Produto atualizado com sucesso!');
      } else {
        const newProduct: Product = {
          id: `prod-${Date.now()}`,
          ...formData,
          createdAt: now,
          updatedAt: now
        };
        await storageService.addProduct(newProduct);
        setSuccess('Produto cadastrado com sucesso!');
      }

      await loadProducts();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error) {
      setError('Erro ao salvar produto. Tente novamente.');
    }
  };

  const handleDelete = (product: Product) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await storageService.deleteProduct(deleteConfirm.id);
        await loadProducts();
        setDeleteConfirm(null);
        setSuccess('Produto excluído com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Erro ao excluir produto. Tente novamente.');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Descrição', 'Preço', 'Categoria', 'URL Imagem', 'Link Afiliado', 'Destaque', 'Ativo'];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.description,
      p.price,
      p.category,
      p.imageUrl,
      p.affiliateLink,
      p.featured,
      p.active
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shopay-products-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

        const importedProducts: Product[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const product: any = {};

          headers.forEach((header, index) => {
            const value = values[index];
            switch (header) {
              case 'Preço':
                product.price = parseFloat(value) || 0;
                break;
              case 'Destaque':
                product.featured = value === 'true';
                break;
              case 'Ativo':
                product.active = value === 'true';
                break;
              default:
                product[header.toLowerCase().replace(' ', '')] = value;
            }
          });

          if (product.name && product.price > 0) {
            importedProducts.push({
              id: product.id || `imported-${Date.now()}-${i}`,
              name: product.name,
              description: product.description || '',
              price: product.price,
              category: product.category || 'Perfumes',
              imageUrl: product.urlimagem || product.imageUrl || '',
              affiliateLink: product.linkafiliado || product.affiliateLink || '',
              featured: product.featured || false,
              active: product.active !== undefined ? product.active : true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }

        importedProducts.forEach(p => storageService.addProduct(p));
        loadProducts();
        setSuccess(`${importedProducts.length} produtos importados com sucesso!`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Erro ao importar arquivo CSV. Verifique o formato.');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    );
  }

  const activeCount = products.filter(p => p.active).length;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-950 sm:text-3xl">Painel Administrativo</h1>
        <button onClick={handleLogout} className="btn-danger">
          Sair
        </button>
      </div>

      {success && (
        <div className="alert alert-success mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <h3 className="text-brand-500 text-sm font-medium">Total de Produtos</h3>
          <p className="text-3xl font-bold text-brand-950 mt-2">{products.length}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-brand-500 text-sm font-medium">Produtos Ativos</h3>
          <p className="text-3xl font-bold text-success-600 mt-2">{activeCount}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-brand-500 text-sm font-medium">Produtos Inativos</h3>
          <p className="text-3xl font-bold text-danger-600 mt-2">{products.length - activeCount}</p>
        </div>
      </div>

      <div className="card mb-8 p-4 sm:p-6">
        <div className="flex flex-col items-stretch justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex-1 w-full space-y-2">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
            <label className="flex items-center text-sm text-brand-600">
              <input
                type="checkbox"
                checked={filterNoLink}
                onChange={(e) => setFilterNoLink(e.target.checked)}
                className="mr-2"
              />
              Mostrar apenas produtos sem link
            </label>
          </div>
          <div className="admin-actions flex flex-wrap gap-2">
            <button onClick={() => handleOpenModal()} className="btn-primary">
              + Novo Produto
            </button>
            <button onClick={() => navigate('/admin/images')} className="btn-secondary">
              Gerenciar Imagens
            </button>
            <button onClick={handleExportCSV} className="btn-secondary">
              Exportar CSV
            </button>
            <label className="btn-secondary cursor-pointer">
              Importar CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="table-container">
        {filteredProducts.length > 0 ? (
          <table className="table table-fixed">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell w-[40%]">
                  Produto
                </th>
                <th className="table-header-cell w-[20%]">
                  Categoria
                </th>
                <th className="table-header-cell w-[15%]">
                  Preço
                </th>
                <th className="table-header-cell w-[10%]">
                  Status
                </th>
                <th className="table-header-cell w-[15%]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                      <div className="ml-3 min-w-0">
                        <div className="text-sm font-medium text-brand-950 truncate">
                          {product.name}
                        </div>
                        {product.featured && (
                          <span className="text-xs text-accent-600">Destaque</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-brand-500 truncate">
                    {product.category}
                  </td>
                  <td className="table-cell text-sm text-brand-950">
                    R$ {product.price.toFixed(2)}
                  </td>
                  <td className="table-cell">
                    {product.active ? (
                      <span className="badge badge-success">
                        Ativo
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="text-accent-600 hover:text-accent-800 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-danger-600 hover:text-danger-800"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8">
            <EmptyState message="Nenhum produto cadastrado." />
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
      >
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="input-label">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label">
                Preço *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="input-field"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">
              URL da Imagem *
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="input-field"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="input-label">
              Link de Afiliado
            </label>
            <input
              type="url"
              value={formData.affiliateLink}
              onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
              className="input-field"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label">
                Marca/Fornecedor
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input-field"
                placeholder="Ex: Cristiane Alves Parfum"
              />
            </div>

            <div>
              <label className="input-label">
                Comissão (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-brand-700">Destacar na página inicial</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-brand-700">Produto ativo</span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row">
            <button type="submit" className="btn-primary flex-1">
              {editingProduct ? 'Atualizar' : 'Cadastrar'}
            </button>
            <button type="button" onClick={handleCloseModal} className="btn-secondary sm:flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-brand-700">
            Tem certeza que deseja excluir o produto <strong>{deleteConfirm?.name}</strong>?
          </p>
          <p className="text-sm text-brand-500">Esta ação não pode ser desfeita.</p>
          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row">
            <button onClick={confirmDelete} className="btn-danger flex-1">
              Confirmar Exclusão
            </button>
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary sm:flex-1">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
