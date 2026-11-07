import { Product } from '../types';
import { supabase } from '../lib/supabase';

// Função auxiliar para converter do formato Supabase para Product
const mapFromSupabase = (data: any): Product => ({
  id: data.id,
  name: data.name,
  description: data.description,
  price: Number(data.price),
  category: data.category,
  imageUrl: data.image_url,
  affiliateLink: data.affiliate_link,
  featured: data.featured,
  active: data.active,
  brand: data.brand,
  commission: data.commission,
  createdAt: data.created_at,
  updatedAt: data.updated_at
});

export const storageService = {
  async getPublicProducts(signal: AbortSignal): Promise<Product[]> {
    const products: Product[] = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,description,price,category,image_url,affiliate_link,featured,active,brand,created_at,updated_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .order('id')
        .range(offset, offset + pageSize - 1)
        .abortSignal(signal);
      if (error) throw error;
      products.push(...data.map(mapFromSupabase));
      if (data.length < pageSize) return products;
    }
  },

  getProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos do Supabase:', error);
        throw error;
      }

      return data ? data.map(mapFromSupabase) : [];
    } catch (error) {
      console.error('Erro ao ler produtos:', error);
      throw error;
    }
  },

  saveProducts: async (products: Product[]): Promise<void> => {
    try {
      // Limpar tabela existente
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', 'never-match');

      if (deleteError) {
        console.error('Erro ao limpar produtos:', deleteError);
        throw deleteError;
      }

      // Inserir novos produtos
      const { error: insertError } = await supabase
        .from('products')
        .insert(
          products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            image_url: p.imageUrl,
            affiliate_link: p.affiliateLink,
            featured: p.featured,
            active: p.active,
            brand: p.brand,
            commission: p.commission,
            created_at: p.createdAt,
            updated_at: p.updatedAt
          }))
        );

      if (insertError) {
        console.error('Erro ao salvar produtos no Supabase:', insertError);
        throw insertError;
      }
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
      throw error;
    }
  },

  addProduct: async (product: Product): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          image_url: product.imageUrl,
          affiliate_link: product.affiliateLink,
          featured: product.featured,
          active: product.active,
          brand: product.brand,
          commission: product.commission,
          created_at: product.createdAt,
          updated_at: product.updatedAt
        });

      if (error) {
        console.error('Erro ao adicionar produto:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, updatedProduct: Product): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          category: updatedProduct.category,
          image_url: updatedProduct.imageUrl,
          affiliate_link: updatedProduct.affiliateLink,
          featured: updatedProduct.featured,
          active: updatedProduct.active,
          brand: updatedProduct.brand,
          commission: updatedProduct.commission,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir produto:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  }
};
