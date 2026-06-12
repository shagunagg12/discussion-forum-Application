import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, LogOut, User, PlusSquare, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-[var(--color-text)] font-bold text-xl hover:text-[var(--color-primary)]">
          <Anchor size={22} className="text-[var(--color-primary)]" />
          <span>Anchors</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/posts/new"
                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                <PlusSquare size={15} />
                New Post
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <User size={15} />
                <span className="font-medium text-[var(--color-text)]">{user.username}</span>
                <span className="rounded-full bg-[var(--color-gold)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--color-gold)]">
                  ⚡ {user.credits}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
