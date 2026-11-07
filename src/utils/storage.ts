import { Product } from '../types';
import { supabase } from '../lib/supabase';

const publicFields = 'id,name,description,price,category,image_url,affiliate_link,featured,active,brand,created_at,updated_at';

function mapFromSupabase(data: Record<string, any>): Product {
  return {
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
    updatedAt: data.updated_at,
  };
}

function editableFields(product: Product) {
  return {
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
  };
}

export function storeProducts(storeId: string) {
  const table = () => supabase.from('products');

  async function list(publicOnly: boolean, signal?: AbortSignal): Promise<Product[]> {
    const products: Product[] = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const query = table().select(publicOnly ? publicFields : '*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false }).order('id')
        .range(offset, offset + pageSize - 1);
      if (publicOnly) query.eq('active', true);
      if (signal) query.abortSignal(signal);
      const { data, error } = await query;
      if (error) throw error;
      products.push(...data.map(mapFromSupabase));
      if (data.length < pageSize) return products;
    }
  }

  return {
    getPublicProducts: (signal: AbortSignal) => list(true, signal),
    getProducts: () => list(false),
    async addProducts(products: Product[]) {
      if (!products.length) return;
      const { error } = await table().insert(products.map((product) => ({
        ...editableFields(product),
        id: product.id,
        store_id: storeId,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
      })));
      if (error) throw error;
    },
    async updateProduct(id: string, product: Product) {
      const { error } = await table().update({ ...editableFields(product), updated_at: new Date().toISOString() })
        .eq('store_id', storeId).eq('id', id).select('id').single();
      if (error) throw error;
    },
    async deleteProduct(id: string) {
      const { error } = await table().delete().eq('store_id', storeId).eq('id', id).select('id').single();
      if (error) throw error;
    },
  };
}
