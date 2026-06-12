import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { MessageSquare, Clock, User } from 'lucide-react';

interface Props {
  post: Post;
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function PostCard({ post }: Props) {
  return (
    <article className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-primary)]/40 hover:shadow-lg hover:shadow-[var(--color-primary)]/5">
      <Link to={`/posts/${post._id}`}>
        <h2 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>
        <p className="text-sm text-[var(--color-muted)] line-clamp-3 mb-4 leading-relaxed">
          {post.body}
        </p>
      </Link>

      <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
        <span className="flex items-center gap-1">
          <User size={12} />
          <Link
            to={`/dashboard`}
            className="hover:text-[var(--color-text)] transition-colors font-medium"
          >
            {post.author.username}
          </Link>
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {timeAgo(post.createdAt)}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <MessageSquare size={12} />
          <Link to={`/posts/${post._id}`} className="hover:text-[var(--color-text)]">
            View thread
          </Link>
        </span>
      </div>
    </article>
  );
}
