import { useEffect, useState } from 'react';
import { api } from '../services/api';

function emptyForm() {
  return { name: '', email: '', password: '', role: 'user' };
}

export default function Navbar({ auth, onAuthChange }) {
  const [form, setForm] = useState(emptyForm());
  const [mode, setMode] = useState('signup');
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState('');

  const logout = () => onAuthChange({ token: '', user: null });

  useEffect(() => {
    if (!auth.user) {
      setShowAuth(true);
      setMode('signup');
    } else {
      setShowAuth(false);
    }
  }, [auth.user]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    try {
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password, role: form.role };
      const response = await api.post(endpoint, payload);
      onAuthChange(response.data);
      setForm(emptyForm());
      setShowAuth(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div>
          <h1 className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-400 bg-clip-text text-3xl font-bold text-transparent">
            EventHub
          </h1>
        </div>

        {auth.user ? (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-300">
              {auth.user.name} ({auth.user.role})
            </span>
            <button className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              className="text-base font-semibold text-slate-300 hover:text-cyan-300"
              onClick={() => {
                setMode('login');
                setShowAuth(true);
                setError('');
              }}
            >
              Log in
            </button>
            <button
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-base font-semibold text-white"
              onClick={() => {
                setMode('signup');
                setShowAuth(true);
                setError('');
              }}
            >
              Sign up
            </button>
          </div>
        )}
      </div>

      {showAuth ? (
        <div className="fixed inset-0 z-40 flex h-screen w-screen items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-xl space-y-3 rounded-2xl border border-fuchsia-500/40 bg-slate-900 p-6 shadow-2xl shadow-fuchsia-900/20"
          >
            <h2 className="text-2xl font-bold text-white">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            {mode === 'signup' ? (
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                placeholder="Name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            ) : null}
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
            {mode === 'signup' ? (
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              >
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
              </select>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white"
                type="submit"
              >
                {mode === 'login' ? 'Log in now' : 'Create account'}
              </button>
              <button
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300"
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Switch to sign up' : 'Switch to log in'}
              </button>
            </div>
            {error ? <p className="w-full text-xs text-rose-400">{error}</p> : null}
          </form>
        </div>
      ) : null}
    </header>
  );
}
