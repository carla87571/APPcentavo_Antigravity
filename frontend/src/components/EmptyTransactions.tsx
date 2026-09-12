"use client";

import React from "react";
import { ReceiptText, PlusCircle, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";

interface EmptyTransactionsProps {
  onAddTransaction?: () => void;
}

export function EmptyTransactions({ onAddTransaction }: EmptyTransactionsProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100/80 text-emerald-600 shadow-inner dark:bg-emerald-950/60 dark:text-emerald-400">
        <ReceiptText className="h-10 w-10 stroke-[1.5]" />
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        No hay transacciones registradas
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Tu listado de movimientos está completamente limpio. Comienza agregando tus primeros ingresos o gastos para que Centavo calcule tus balances y presupuestos.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onAddTransaction}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Registrar primera transacción
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 border-t border-slate-200/60 pt-6 text-xs text-slate-400 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
          </div>
          <span>Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <ArrowDownRight className="h-3 w-3" />
          </div>
          <span>Gastos</span>
        </div>
      </div>
    </div>
  );
}
