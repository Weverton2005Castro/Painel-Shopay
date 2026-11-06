import { Category } from '../types';

export interface CategoryMeta {
  label: string;
  icon: string;
  chip: string;
  tile: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Perfumes: {
    label: 'Perfumes',
    icon: 'sparkles',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
    tile: 'bg-rose-50 text-rose-600',
  },
  'Casa e Utilidades': {
    label: 'Casa e Utilidades',
    icon: 'home',
    chip: 'bg-sky-50 text-sky-700 border-sky-200',
    tile: 'bg-sky-50 text-sky-600',
  },
  Beleza: {
    label: 'Beleza',
    icon: 'sparkle',
    chip: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    tile: 'bg-fuchsia-50 text-fuchsia-600',
  },
  Acessórios: {
    label: 'Acessórios',
    icon: 'bag',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    tile: 'bg-amber-50 text-amber-600',
  },
  Cursos: {
    label: 'Cursos',
    icon: 'book',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tile: 'bg-emerald-50 text-emerald-600',
  },
  Alimentos: {
    label: 'Alimentos',
    icon: 'shopping-bag',
    chip: 'bg-orange-50 text-orange-700 border-orange-200',
    tile: 'bg-orange-50 text-orange-600',
  },
  Papelaria: {
    label: 'Papelaria',
    icon: 'pencil',
    chip: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    tile: 'bg-indigo-50 text-indigo-600',
  },
  Serviços: {
    label: 'Serviços',
    icon: 'briefcase',
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
    tile: 'bg-violet-50 text-violet-600',
  },
  Cosméticos: {
    label: 'Cosméticos',
    icon: 'heart',
    chip: 'bg-pink-50 text-pink-700 border-pink-200',
    tile: 'bg-pink-50 text-pink-600',
  },
  Outros: {
    label: 'Outros',
    icon: 'grid',
    chip: 'bg-brand-100 text-brand-700 border-brand-200',
    tile: 'bg-brand-100 text-brand-600',
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as Category[];

export function getCategoryMeta(category: string): CategoryMeta {
  return (CATEGORY_META as Record<string, CategoryMeta>)[category] || CATEGORY_META.Outros;
}
