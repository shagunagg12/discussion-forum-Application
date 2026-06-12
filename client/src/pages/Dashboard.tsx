import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { creditsApi } from '../api/credits';
import { postsApi } from '../api/posts';
import type { CreditConfig, CreditTransaction, Post } from '../types';
import toast from 'react-hot-toast';
import { Zap, Settings, FileText, TrendingUp, RotateCcw } from 'lucide-react';

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function Dashboard() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [config, setConfig] = useState<CreditConfig | null>(null);
  const [configForm, setConfigForm] = useState({ startValue: 1, increment: 2 });
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfigEdit, setShowConfigEdit] = useState(false);

  useEffect(() => {
    if (!user) return;

    creditsApi.getUserCredits(user._id).then(({ transactions }) => {
      setTransactions(transactions);
    });

    postsApi.getAll().then((posts) => {
      setMyPosts(posts.filter((p) => p.author._id === user._id));
    });

    creditsApi.getConfig().then((cfg) => {
      setConfig(cfg);
      setConfigForm({ startValue: cfg.startValue, increment: cfg.increment });
    });
  }, [user]);

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const updated = await creditsApi.updateConfig(configForm);
      setConfig(updated);
      setShowConfigEdit(false);
      toast.success('Credit config updated!');
    } catch {
      toast.error('Failed to update config');
    } finally {
      setSavingConfig(false);
    }
  };

  if (!user) return null;

  const activeCredits = transactions.filter((t) => !t.isReversed).reduce((s, t) => s + t.amount, 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        {/* Credit total card */}
        <div className="col-span-1 md:col-span-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--color-gold)] mb-2">
            <Zap size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Total Credits</span>
          </div>
          <p className="text-4xl font-bold text-[var(--color-gold)]">{user.credits}</p>
          <p className="text-xs text-[var(--color-muted)]">{activeCredits} from active comments</p>
        </div>

        {/* Posts count */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-[var(--color-primary)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Your Posts</span>
          </div>
          <p className="text-4xl font-bold text-[var(--color-text)]">{myPosts.length}</p>
          <Link to="/posts/new" className="text-xs text-[var(--color-primary)] hover:underline mt-1">
            + Create new post
          </Link>
        </div>

        {/* Comments received */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-[var(--color-accent)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Comments Received</span>
          </div>
          <p className="text-4xl font-bold text-[var(--color-text)]">{transactions.length}</p>
          <p className="text-xs text-[var(--color-muted)]">{transactions.filter((t) => t.isReversed).length} reversed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Credit History */}
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Zap size={14} className="text-[var(--color-gold)]" />
            Credit History
          </h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No transactions yet. Share a post and get comments!</p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <li
                  key={tx._id}
                  className={`flex items-start justify-between rounded-lg p-3 text-xs border ${
                    tx.isReversed
                      ? 'border-[var(--color-border)] opacity-50'
                      : 'border-[var(--color-success)]/20 bg-[var(--color-success)]/5'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-[var(--color-text)]">
                      {tx.postId?.title || 'Post'}
                    </span>
                    <span className="text-[var(--color-muted)]">
                      Depth {tx.depth} comment · {timeAgo(tx.createdAt)}
                    </span>
                    {tx.isReversed && (
                      <span className="flex items-center gap-1 text-[var(--color-danger)]">
                        <RotateCcw size={10} />
                        Reversed
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-bold ${tx.isReversed ? 'line-through text-[var(--color-muted)]' : 'text-[var(--color-success)]'}`}
                  >
                    +{tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Credit Config */}
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <Settings size={14} className="text-[var(--color-primary)]" />
              Credit Config
            </h2>
            <button
              onClick={() => setShowConfigEdit(!showConfigEdit)}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              {showConfigEdit ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {config && !showConfigEdit && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-muted)]">
                Formula: <code className="rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[var(--color-accent)]">credit(depth) = {config.startValue} + (depth - 1) × {config.increment}</code>
              </p>
              <div className="rounded-lg bg-[var(--color-surface-2)] p-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[var(--color-muted)]">
                      <th className="text-left pb-1">Depth</th>
                      <th className="text-left pb-1">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((d) => (
                      <tr key={d} className="border-t border-[var(--color-border)]">
                        <td className="py-1 text-[var(--color-muted)]">Depth {d}</td>
                        <td className="py-1 font-semibold text-[var(--color-gold)]">
                          {config.startValue + (d - 1) * config.increment}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showConfigEdit && (
            <form onSubmit={saveConfig} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Start Value (depth 1)</label>
                <input
                  type="number"
                  min={0}
                  value={configForm.startValue}
                  onChange={(e) => setConfigForm((f) => ({ ...f, startValue: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Increment per depth</label>
                <input
                  type="number"
                  min={0}
                  value={configForm.increment}
                  onChange={(e) => setConfigForm((f) => ({ ...f, increment: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div className="text-xs text-[var(--color-muted)] rounded-lg bg-[var(--color-surface-2)] p-2">
                Preview: depth 1 = <strong className="text-[var(--color-gold)]">{configForm.startValue}</strong>,
                depth 2 = <strong className="text-[var(--color-gold)]">{configForm.startValue + configForm.increment}</strong>,
                depth 3 = <strong className="text-[var(--color-gold)]">{configForm.startValue + 2 * configForm.increment}</strong>
              </div>
              <button
                type="submit"
                disabled={savingConfig}
                className="rounded-lg bg-[var(--color-primary)] py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
              >
                {savingConfig ? 'Saving…' : 'Save Config'}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Your Posts */}
      {myPosts.length > 0 && (
        <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <FileText size={14} className="text-[var(--color-primary)]" />
            Your Posts
          </h2>
          <ul className="flex flex-col gap-2">
            {myPosts.map((post) => (
              <li key={post._id}>
                <Link
                  to={`/posts/${post._id}`}
                  className="flex items-center justify-between rounded-lg p-3 border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-colors"
                >
                  <span className="text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                    {post.title}
                  </span>
                  <span className="text-xs text-[var(--color-muted)] ml-3 shrink-0">{timeAgo(post.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
