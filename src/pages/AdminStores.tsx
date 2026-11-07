import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Store, storeFields } from '../hooks/useStore';
import { supabase } from '../lib/supabase';

export default function AdminStores() {
  const { isPlatformAdmin, userId, logout } = useAuth();
  const [params] = useSearchParams();
  const [stores, setStores] = useState<Store[]>();
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useDocumentMeta({ title: 'Administração de lojas', description: 'Gerencie suas lojas.', path: '/admin/dashboard', noindex: true });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const { error: claimError } = await supabase.rpc('claim_store_invitations').abortSignal(controller.signal);
      if (claimError) throw claimError;
      let query = supabase.from('stores').select(storeFields).order('name');
      if (!isPlatformAdmin) {
        const { data, error } = await supabase.from('store_members').select('store_id')
          .eq('user_id', userId!).abortSignal(controller.signal);
        if (error) throw error;
        if (!data.length) return [];
        query = query.in('id', data.map((membership) => membership.store_id)).eq('active', true);
      }
      const { data, error } = await query.abortSignal(controller.signal);
      if (error) throw error;
      return data;
    }

    load().then((data) => {
      if (!controller.signal.aborted) setStores(data);
    }, () => {
      if (!controller.signal.aborted) setError('Não foi possível carregar suas lojas.');
    });
    return () => controller.abort();
  }, [attempt, isPlatformAdmin, userId]);

  async function createStore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const { data, error } = await supabase.from('stores').insert({
        name: String(values.get('name')).trim(),
        slug: String(values.get('slug')).trim().toLowerCase(),
      }).select(storeFields).single();
      if (error) {
        setError(error.code === '23505' ? 'Este endereço já está em uso.' : 'Não foi possível criar a loja.');
        return;
      }
      setStores((current) => [...(current ?? []), data].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
      form.reset();
    } finally {
      setBusy(false);
    }
  }

  if (!isPlatformAdmin && stores?.length === 1 && !params.has('lojas')) {
    return <Navigate to={`/admin/lojas/${stores[0].slug}`} replace />;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{isPlatformAdmin ? 'Lojas da plataforma' : 'Minhas lojas'}</h1>
        <button className="btn-secondary" onClick={async () => {
          if (!await logout()) setError('Não foi possível sair. Tente novamente.');
        }}>Sair</button>
      </div>
      {error && <p role="alert" className="alert alert-danger">{error}</p>}
      {!stores && (error
        ? <button className="btn-secondary" onClick={() => {
          setError('');
          setAttempt((current) => current + 1);
        }}>Tentar novamente</button>
        : <LoadingSpinner />)}

      {stores && isPlatformAdmin && (
        <form onSubmit={createStore} className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="text-xl font-bold sm:col-span-2">Cadastrar loja</h2>
          <label className="text-sm font-semibold">Nome <input className="input-field mt-1" name="name" required maxLength={100} /></label>
          <label className="text-sm font-semibold">Endereço da loja
            <input className="input-field mt-1" name="slug" required maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="ex. bella" />
          </label>
          <button className="btn-primary justify-self-start" disabled={busy}>Criar loja</button>
        </form>
      )}

      {stores?.length === 0 && <p className="card p-5">Você ainda não tem lojas disponíveis. Se recebeu um convite, confirme seu e-mail e entre com o endereço convidado.</p>}
      {stores?.map((store) => (
        <article key={store.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-lg font-bold">{store.name}</h2>
            <p className="text-sm text-brand-600">/loja/{store.slug} · {store.active ? 'Ativa' : 'Suspensa'}</p>
          </div>
          <Link className="btn-secondary" to={`/admin/lojas/${store.slug}`}>Gerenciar</Link>
        </article>
      ))}
    </div>
  );
}
