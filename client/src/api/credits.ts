import api from './client';
import type { CreditConfig, CreditTransaction, User } from '../types';

export const creditsApi = {
  getConfig: () => api.get<CreditConfig>('/credits/config').then((r) => r.data),

  updateConfig: (data: { startValue: number; increment: number }) =>
    api.put<CreditConfig>('/credits/config', data).then((r) => r.data),

  getUserCredits: (userId: string) =>
    api
      .get<{ user: User; transactions: CreditTransaction[] }>(`/credits/users/${userId}`)
      .then((r) => r.data),
};
