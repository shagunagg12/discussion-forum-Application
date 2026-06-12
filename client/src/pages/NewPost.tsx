import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText } from 'lucide-react';

export default function NewPost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const post = await postsApi.create(form);
      toast.success('Post created!');
      navigate(`/posts/${post._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: { msg: string }[]; message?: string } } };
      const msg =
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.message ||
        'Failed to create post';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <div className="mb-6 flex items-center gap-2">
          <FileText size={20} className="text-[var(--color-primary)]" />
          <h1 className="text-xl font-bold text-[var(--color-text)]">Create a Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">
              Title <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={200}
              placeholder="Give your post a clear, descriptive title"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            />
            <p className="mt-1 text-right text-xs text-[var(--color-muted)]">{form.title.length}/200</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">
              Body <span className="text-[var(--color-danger)]">*</span>
            </label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              required
              minLength={10}
              rows={10}
              placeholder="Share your thoughts in detail…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none resize-y transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Publishing…' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
