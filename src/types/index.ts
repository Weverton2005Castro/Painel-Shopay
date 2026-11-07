export type Category = 'Perfumes' | 'Casa e Utilidades' | 'Beleza' | 'Acessórios' | 'Cursos' | 'Alimentos' | 'Papelaria' | 'Serviços' | 'Cosméticos' | 'Outros';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  affiliateLink: string;
  featured: boolean;
  active: boolean;
  brand?: string;
  commission?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  affiliateLink: string;
  featured: boolean;
  active: boolean;
  brand?: string;
  commission?: number;
}

export interface AuthContextType {
  authReady: boolean;
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  userId?: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

export interface FilterOptions {
  category?: Category;
  search?: string;
  sortBy?: 'name' | 'price-asc' | 'price-desc';
}
