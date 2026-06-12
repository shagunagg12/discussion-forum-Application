import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentsApi } from '../api/comments';
import type { Comment } from '../types';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

interface Props {
  postId: string;
  parentId?: string | null;
  placeholder?: string;
  onCreated: (comment: Comment) => void;
  onCancel?: () => void;
}

export default function CommentForm({ postId, parentId = null, placeholder = 'Write a comment…', onCreated, onCancel }: Props) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    try {
      const comment = await commentsApi.create(postId, { body: body.trim(), parentId });
      setBody('');
      onCreated(comment);
      toast.success('Comment posted!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <p className="text-sm text-[var(--color-muted)] italic">
        <a href="/login" className="text-[var(--color-primary)] hover:underline">Log in</a> to comment
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none resize-none transition-colors"
      />
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
        >
          <Send size={12} />
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
