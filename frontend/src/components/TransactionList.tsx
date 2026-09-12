"use client";

import React from "react";
import { Transaction } from "@/types/transaction";
import { EmptyTransactions } from "./EmptyTransactions";
import { ArrowDownRight, ArrowUpRight, Loader2, RefreshCw, Tag } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  alimentacion: "Comida",
  food: "Comida",
  transporte: "Transporte",
  transport: "Transporte",
  ocio: "Ocio",
  entertainment: "Ocio",
  servicios: "Servicios",
  services: "Servicios",
  salud: "Salud",
  educacion: "Educación",
  vivienda: "Vivienda",
  housing: "Vivienda",
  salary: "Salario",
  otros: "Otros",
  other: "Otros",
};

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  onReload: () => void;
  onAddTransaction: () => void;
}

export function TransactionList({
  transactions,
  isLoading,
  error,
  onReload,
  onAddTransaction,
}: TransactionListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Historial de Transacciones
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registro cronológico de tus movimientos financieros
          </p>
        </div>

        <button
          type="button"
          onClick={onReload}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Actualizar transacciones"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cargando transacciones...
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyTransactions onAddTransaction={onAddTransaction} />
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
          {transactions.map((tx) => {
            const isIncome = String(tx.type).toLowerCase() === "income";
            const categoryDisplay = CATEGORY_LABELS[String(tx.category).toLowerCase()] || tx.category;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {tx.description}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                        <Tag className="h-3 w-3" />
                        {categoryDisplay}
                      </span>
                      <span className="text-xs text-slate-400">• {tx.date}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`font-semibold text-base ${
                    isIncome
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                    minimumFractionDigits: 0,
                  }).format(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
