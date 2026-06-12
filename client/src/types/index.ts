export interface User {
  _id: string;
  username: string;
  email: string;
  credits: number;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  body: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  parentId: string | null;
  depth: number;
  author: User;
  body: string;
  isDeleted: boolean;
  children: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreditConfig {
  _id: string;
  startValue: number;
  increment: number;
  updatedAt: string;
}

export interface CreditTransaction {
  _id: string;
  postId: { _id: string; title: string };
  commentId: { _id: string; body: string; depth: number };
  opId: string;
  amount: number;
  depth: number;
  isReversed: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
