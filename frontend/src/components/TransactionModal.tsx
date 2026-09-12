"use client";

import React, { useState } from "react";
import { X, PlusCircle, Loader2 } from "lucide-react";
import { Transaction } from "@/types/transaction";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, "id">) => Promise<void>;
}

export function TransactionModal({ isOpen, onClose, onSubmit }: TransactionModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState<string>("50000");
  const [category, setCategory] = useState<string>("alimentacion");
  const [description, setDescription] = useState<string>("Comida");
  const [date, setDate] = useState<string>(today);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Por favor ingresa un monto válido mayor a cero.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        amount: parsedAmount,
        type,
        category,
        description: description.trim() || "Gasto",
        date,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar transacción");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Registrar Transacción
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ingresa los detalles del movimiento financiero
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Monto */}
          <div>
            <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Monto ($)
            </label>
            <input
              id="tx-amount"
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Categoría
            </label>
            <select
              id="tx-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="alimentacion">Comida</option>
              <option value="transporte">Transporte</option>
              <option value="ocio">Ocio / Entretenimiento</option>
              <option value="servicios">Servicios</option>
              <option value="salud">Salud</option>
              <option value="educacion">Educación</option>
              <option value="vivienda">Vivienda</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="tx-description" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Descripción
            </label>
            <input
              id="tx-description"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Almuerzo familiar o Compra de Comida"
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Fecha
            </label>
            <input
              id="tx-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                <span>Guardar Transacción</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
