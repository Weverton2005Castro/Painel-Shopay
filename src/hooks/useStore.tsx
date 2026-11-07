import { createContext, useContext, useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface Store {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  logo_url: string;
  description: string;
}

export const storeFields = 'id,slug,name,active,logo_url,description';
const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Loja ausente no contexto.');
  return store;
}

export function useStorePath() {
  const { slug } = useStore();
  return (path: string) => slug === 'shopay' ? path : `/loja/${slug}${path === '/' ? '' : path}`;
}

export function StoreScope({ admin = false }: { admin?: boolean }) {
  const { slug = 'shopay' } = useParams();
  const { userId } = useAuth();
  return <StoreLoader key={admin ? `${slug}:${userId}` : slug} slug={slug} admin={admin} />;
}

function StoreLoader({ slug, admin }: { slug: string; admin: boolean }) {
  const [store, setStore] = useState<Store | null>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let query = supabase.from('stores').select(storeFields).eq('slug', slug);
    if (!admin) query = query.eq('active', true);
    async function load() {
      const { data, error } = await query.abortSignal(controller.signal).maybeSingle();
      if (error) throw error;
      if (!data || !admin) return data;
      const access = await supabase.rpc('can_manage_store', { target_store: data.id }).abortSignal(controller.signal);
      if (access.error) throw access.error;
      return access.data === true ? data : null;
    }
    load().then((data) => {
      if (controller.signal.aborted) return;
      setStore(data);
    }, () => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => controller.abort();
  }, [slug, admin, attempt]);

  if (failed) return (
    <div role="alert" className="container mx-auto p-8">
      <p>Não foi possível carregar a loja.</p>
      <button className="btn-secondary mt-3" onClick={() => {
        setFailed(false);
        setAttempt((current) => current + 1);
      }}>Tentar novamente</button>
    </div>
  );
  if (store === undefined) return <LoadingSpinner />;
  if (!store) return <div className="container mx-auto p-8"><h1 className="text-2xl font-bold">Loja indisponível</h1><Link to={admin ? "/admin/dashboard" : "/"} className="btn-secondary mt-4">Voltar</Link></div>;
  return <StoreContext.Provider value={store}><Outlet /></StoreContext.Provider>;
}
