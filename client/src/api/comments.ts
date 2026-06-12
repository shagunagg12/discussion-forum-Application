import api from './client';
import type { Comment } from '../types';

export const commentsApi = {
  getByPost: (postId: string) =>
    api.get<Comment[]>(`/posts/${postId}/comments`).then((r) => r.data),

  create: (postId: string, data: { body: string; parentId?: string | null }) =>
    api.post<Comment>(`/posts/${postId}/comments`, data).then((r) => r.data),

  delete: (commentId: string) =>
    api.delete(`/comments/${commentId}`).then((r) => r.data),
};
