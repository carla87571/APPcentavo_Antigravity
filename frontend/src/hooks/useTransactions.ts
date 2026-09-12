"use client";

import { useState, useEffect, useCallback } from "react";
import { Transaction } from "@/types/transaction";
import { transactionService } from "@/services/transactionService";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar las transacciones";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (data: Omit<Transaction, "id">) => {
    try {
      const newTx = await transactionService.createTransaction(data);
      setTransactions((prev) => [newTx, ...prev]);
      return newTx;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al registrar transacción";
      setError(message);
      throw err;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    reload: fetchTransactions,
    addTransaction,
    hasTransactions: transactions.length > 0,
  };
}
