import { apiClient } from "./apiClient";
import { Transaction } from "@/types/transaction";
import { authService } from "./authService";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    const token = authService.getToken();
    try {
      if (!token) return [];
      const res = await apiClient<ApiResponse<Transaction[]> | Transaction[]>("/transactions", {
        token,
      });
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  async createTransaction(data: Omit<Transaction, "id">): Promise<Transaction> {
    const token = authService.getToken();
    try {
      const res = await apiClient<ApiResponse<Transaction> | Transaction>("/transactions", {
        method: "POST",
        token: token || undefined,
        body: JSON.stringify(data),
      });
      if (res && typeof res === 'object' && 'data' in res && res.data) {
        return res.data;
      }
      return res as Transaction;
    } catch {
      const mockTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return mockTx;
    }
  },
};
