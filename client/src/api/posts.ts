import api from './client';
import type { Post } from '../types';

export const postsApi = {
  getAll: () => api.get<Post[]>('/posts').then((r) => r.data),
  getOne: (id: string) => api.get<Post>(`/posts/${id}`).then((r) => r.data),
  create: (data: { title: string; body: string }) =>
    api.post<Post>('/posts', data).then((r) => r.data),
};
