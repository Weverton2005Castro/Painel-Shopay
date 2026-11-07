import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useDocumentMeta({
    title: 'Acesso administrativo',
    description: 'Área restrita do painel administrativo Shopay.',
    path: '/admin',
    noindex: true,
  });

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      if (!(await login(email.trim(), password))) setError('Não foi possível entrar com essas credenciais.');
    } catch {
      setError('Não foi possível acessar o painel. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <p className="section-title text-center">Shopay • Administração</p>
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-950">
          Acesso Administrativo
        </h1>

        {error && (
          <div role="alert" className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="input-label">
              E-mail
            </label>
            <input
              type="email"
              required
              id="admin-email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="E-mail da conta administrativa"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="input-label">
              Senha
            </label>
            <input
              type="password"
              required
              id="admin-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Digite sua senha"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <Link to="/" className="block text-center text-sm font-semibold text-brand-500 transition-colors hover:text-brand-800">
            ← Voltar à loja
          </Link>
        </div>
      </div>
    </div>
  );
}
