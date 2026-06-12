import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Anchor, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.login(form);
      login(token, user);
      toast.success(`Welcome back, ${user.username}!`);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <div className="mb-6 flex flex-col items-center gap-2">
            <Anchor size={32} className="text-[var(--color-primary)]" />
            <h1 className="text-xl font-bold text-[var(--color-text)]">Welcome back</h1>
            <p className="text-sm text-[var(--color-muted)]">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-lg bg-[var(--color-primary)] py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[var(--color-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-primary)] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
