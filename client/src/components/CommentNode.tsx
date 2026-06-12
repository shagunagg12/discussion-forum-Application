import { useState } from 'react';
import type { Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { commentsApi } from '../api/comments';
import CommentForm from './CommentForm';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Reply, Trash2, MessageSquare } from 'lucide-react';

interface Props {
  comment: Comment;
  postId: string;
  onCommentAdded: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  depth?: number;
}

const INDENT_PX = 20;
const MAX_INDENT = 5;

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Left-border accent colors per depth level
const depthColors = [
  'border-[var(--color-primary)]',
  'border-[var(--color-accent)]',
  'border-[var(--color-success)]',
  'border-[var(--color-gold)]',
  'border-pink-500',
  'border-orange-400',
];

export default function CommentNode({ comment, postId, onCommentAdded, onCommentDeleted, depth = 0 }: Props) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const indentPx = Math.min(depth, MAX_INDENT) * INDENT_PX;
  const borderColor = depthColors[depth % depthColors.length];

  const handleDelete = async () => {
    if (!confirm('Delete this comment? Credits awarded to the OP will be reversed.')) return;
    setDeleting(true);
    try {
      await commentsApi.delete(comment._id);
      onCommentDeleted(comment._id);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setShowReply(false);
    onCommentAdded(newComment);
  };

  const hasChildren = comment.children && comment.children.length > 0;
  const isOwner = user?._id === comment.author?._id;

  return (
    <div style={{ marginLeft: indentPx }} className={`border-l-2 ${borderColor} pl-3 my-2`}>
      <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-3 transition-colors hover:border-[var(--color-border)]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {hasChildren && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          <span className="text-xs font-semibold text-[var(--color-primary)]">
            {comment.isDeleted ? '[deleted]' : comment.author?.username ?? 'Unknown'}
          </span>
          <span className="text-xs text-[var(--color-muted)]">
            · depth {comment.depth} · {timeAgo(comment.createdAt)}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {!comment.isDeleted && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
              >
                <Reply size={12} />
                Reply
              </button>
            )}
            {isOwner && !comment.isDeleted && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
              >
                <Trash2 size={12} />
                {deleting ? '…' : 'Delete'}
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <p className={`text-sm leading-relaxed ${comment.isDeleted ? 'italic text-[var(--color-muted)]' : 'text-[var(--color-text)]'}`}>
          {comment.isDeleted ? '[This comment has been deleted]' : comment.body}
        </p>

        {/* Reply form */}
        {showReply && !comment.isDeleted && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
            <CommentForm
              postId={postId}
              parentId={comment._id}
              placeholder={`Replying to ${comment.author?.username}…`}
              onCreated={handleCommentAdded}
              onCancel={() => setShowReply(false)}
            />
          </div>
        )}
      </div>

      {/* Children */}
      {!collapsed && hasChildren && (
        <div className="mt-1">
          {comment.children.map((child) => (
            <CommentNode
              key={child._id}
              comment={child}
              postId={postId}
              onCommentAdded={onCommentAdded}
              onCommentDeleted={onCommentDeleted}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Collapsed summary */}
      {collapsed && hasChildren && (
        <button
          onClick={() => setCollapsed(false)}
          className="mt-1 flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <MessageSquare size={11} />
          {comment.children.length} collapsed {comment.children.length === 1 ? 'reply' : 'replies'}
        </button>
      )}
    </div>
  );
}
