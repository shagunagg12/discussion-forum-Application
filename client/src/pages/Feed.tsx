import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../api/posts';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { Flame, PlusSquare } from 'lucide-react';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi
      .getAll()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-text)]">
            <Flame size={24} className="text-[var(--color-primary)]" />
            Latest Posts
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {posts.length} {posts.length === 1 ? 'thread' : 'threads'} — newest first
          </p>
        </div>
        {user && (
          <Link
            to="/posts/new"
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <PlusSquare size={16} />
            New Post
          </Link>
        )}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-16 text-center">
          <p className="text-[var(--color-muted)]">No posts yet. Be the first!</p>
          {user && (
            <Link
              to="/posts/new"
              className="mt-4 inline-block rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-hover)]"
            >
              Create a post
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
