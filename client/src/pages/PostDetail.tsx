import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts';
import { commentsApi } from '../api/comments';
import type { Post, Comment } from '../types';
import CommentNode from '../components/CommentNode';
import CommentForm from '../components/CommentForm';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Clock, MessageSquare } from 'lucide-react';

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Insert a new comment into the right position in the tree
const insertComment = (tree: Comment[], newComment: Comment): Comment[] => {
  if (!newComment.parentId) {
    return [...tree, newComment];
  }

  return tree.map((node) => {
    if (node._id === newComment.parentId) {
      return { ...node, children: [...(node.children || []), newComment] };
    }
    if (node.children?.length) {
      return { ...node, children: insertComment(node.children, newComment) };
    }
    return node;
  });
};

// Soft-delete a comment in the tree (mark isDeleted)
const markDeleted = (tree: Comment[], commentId: string): Comment[] =>
  tree.map((node) => {
    if (node._id === commentId) return { ...node, isDeleted: true };
    if (node.children?.length) {
      return { ...node, children: markDeleted(node.children, commentId) };
    }
    return node;
  });

const countComments = (tree: Comment[]): number =>
  tree.reduce((acc, node) => acc + 1 + countComments(node.children || []), 0);

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (!id) return;
    postsApi
      .getOne(id)
      .then(setPost)
      .catch(() => {
        toast.error('Post not found');
        navigate('/');
      })
      .finally(() => setLoadingPost(false));

    commentsApi
      .getByPost(id)
      .then(setComments)
      .finally(() => setLoadingComments(false));
  }, [id, navigate]);

  const handleCommentAdded = useCallback((comment: Comment) => {
    setComments((prev) => insertComment(prev, { ...comment, children: [] }));
  }, []);

  const handleCommentDeleted = useCallback((commentId: string) => {
    setComments((prev) => markDeleted(prev, commentId));
  }, []);

  if (loadingPost) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!post) return null;

  const commentCount = countComments(comments);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to feed
      </button>

      {/* Post */}
      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3 leading-snug">{post.title}</h1>
        <div className="flex items-center gap-4 text-xs text-[var(--color-muted)] mb-5">
          <span className="flex items-center gap-1">
            <User size={12} />
            <span className="font-medium text-[var(--color-text)]">{post.author.username}</span>
            <span className="rounded-full bg-[var(--color-gold)]/20 px-1.5 text-[var(--color-gold)]">
              ⚡ {post.author.credits}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {timeAgo(post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </span>
        </div>
        <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap text-sm">{post.body}</p>
      </article>

      {/* Comment form */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
          Join the discussion
        </h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <CommentForm postId={post._id} onCreated={handleCommentAdded} />
        </div>
      </section>

      {/* Comments */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-4">
          <MessageSquare size={14} />
          {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
        </h2>

        {loadingComments ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center">
            <p className="text-sm text-[var(--color-muted)]">No comments yet. Start the discussion!</p>
          </div>
        ) : (
          <div>
            {comments.map((comment) => (
              <CommentNode
                key={comment._id}
                comment={comment}
                postId={post._id}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
                depth={0}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
