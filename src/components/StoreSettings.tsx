import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { supabase } from '../lib/supabase';

interface AccessEntry {
  user_id: string;
  email: string;
}

export default function StoreSettings({ onRename }: { onRename: (name: string) => void }) {
  const store = useStore();
  const { isPlatformAdmin } = useAuth();
  const [name, setName] = useState(store.name);
  const [active, setActive] = useState(store.active);
  const [members, setMembers] = useState<AccessEntry[]>([]);
  const [invites, setInvites] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isPlatformAdmin) return;
    const controller = new AbortController();
    Promise.all([
      supabase.rpc('store_access_list', { target_store: store.id }).abortSignal(controller.signal),
      supabase.from('store_invitations').select('email').eq('store_id', store.id).order('email').abortSignal(controller.signal),
    ]).then(([access, pending]) => {
      if (controller.signal.aborted) return;
      if (access.error || pending.error) {
        setError('Não foi possível carregar os acessos da loja.');
        return;
      }
      setMembers(access.data);
      setInvites(pending.data.map(({ email }) => email));
    });
    return () => controller.abort();
  }, [isPlatformAdmin, store.id, attempt]);

  async function perform(action: () => Promise<void>, success: string) {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await action();
      setMessage(success);
    } catch {
      setError('Não foi possível concluir a alteração. Confira os dados e tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    void perform(async () => {
      const { error } = await supabase.rpc('update_store_profile', {
        target_store: store.id,
        new_name: name.trim(),
        new_description: String(values.get('description')),
        new_logo: String(values.get('logo')),
      });
      if (error) throw error;
      onRename(name.trim());
    }, 'Vitrine atualizada.');
  }

  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get('email')).trim().toLowerCase();
    if (members.some((member) => member.email.toLowerCase() === email) || invites.includes(email)) {
      setError('Este e-mail já tem acesso ou convite pendente.');
      return;
    }
    void perform(async () => {
      const { error } = await supabase.from('store_invitations').insert({ store_id: store.id, email });
      if (error) throw error;
      form.reset();
      setAttempt((current) => current + 1);
    }, 'Convite registrado. Compartilhe o endereço de acesso com o responsável.');
  }

  function removeAccess(email: string, userId?: string) {
    void perform(async () => {
      if (userId) {
        const { error } = await supabase.from('store_members').delete().eq('store_id', store.id).eq('user_id', userId).select('user_id').single();
        if (error) throw error;
      } else {
        const { error } = await supabase.from('store_invitations').delete().eq('store_id', store.id).eq('email', email).select('email').single();
        if (error) throw error;
      }
      setAttempt((current) => current + 1);
    }, userId ? 'Acesso removido.' : 'Convite cancelado.');
  }

  return (
    <details className="card mb-6 p-5">
      <summary className="cursor-pointer text-lg font-bold">Configurações da loja</summary>
      {error && <p className="alert alert-danger mt-4" role="alert">{error}</p>}
      {message && <p className="alert alert-success mt-4" role="status">{message}</p>}
      <form onSubmit={saveProfile} className="mt-4 grid gap-3">
        <label>Nome <input className="input-field mt-1" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>URL do logo <input type="url" className="input-field mt-1" name="logo" pattern="https://.+" defaultValue={store.logo_url} /></label>
        <label>Descrição <textarea className="input-field mt-1" name="description" maxLength={500} defaultValue={store.description} /></label>
        <button className="btn-primary justify-self-start" disabled={busy}>Salvar vitrine</button>
      </form>
      {isPlatformAdmin && (
        <div className="mt-6 space-y-4 border-t border-brand-200 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Acessos da loja</h2>
            <button className="btn-secondary" disabled={busy} onClick={() => void perform(async () => {
              const { error } = await supabase.from('stores').update({ active: !active }).eq('id', store.id).select('id').single();
              if (error) throw error;
              setActive(!active);
            }, active ? 'Loja suspensa.' : 'Loja reativada.')}>{active ? 'Suspender loja' : 'Reativar loja'}</button>
          </div>
          <p className="text-sm text-brand-600">Registre o e-mail e compartilhe o link de acesso. O responsável entra ou cria uma conta com esse endereço.</p>
          <a href="/admin" className="block break-all text-sm font-semibold text-accent-700 underline">{new URL('/admin', window.location.origin).href}</a>
          <form className="flex flex-wrap gap-2" onSubmit={invite}>
            <input type="email" name="email" required maxLength={254} aria-label="E-mail do responsável" placeholder="E-mail do responsável" className="input-field flex-1 basis-52" />
            <button className="btn-primary" disabled={busy}>Registrar convite</button>
          </form>
          {[...members.map((member) => ({ ...member, key: member.user_id })), ...invites.map((email) => ({ email, user_id: undefined, key: email }))].map((entry) => (
            <div key={entry.key} className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-100 pt-2 text-sm">
              <span className="break-all">{entry.email} · {entry.user_id ? 'Ativo' : 'Convite pendente'}</span>
              <button className="btn-ghost" disabled={busy} onClick={() => removeAccess(entry.email, entry.user_id)}>{entry.user_id ? 'Remover acesso' : 'Cancelar convite'}</button>
            </div>
          ))}
        </div>
      )}
    </details>
  );
}
