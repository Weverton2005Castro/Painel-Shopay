import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (login(username, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <p className="section-title text-center">Shopay • Administração</p>
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-950">
          Acesso Administrativo
        </h1>

        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="input-label">
              Usuário
            </label>
            <input
              type="text"
              id="admin-username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Digite seu usuário"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="input-label">
              Senha
            </label>
            <input
              type="password"
              id="admin-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Digite sua senha"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>
        </form>

        <div className="mt-6 p-4 alert alert-info">
          <p className="text-sm">
            <strong>Credenciais de demonstração:</strong><br />
            Usuário: admin<br />
            Senha: admin123
          </p>
        </div>
      </div>
    </div>
  );
}
