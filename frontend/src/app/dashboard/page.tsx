"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { Wallet, TrendingUp, TrendingDown, Loader2, Calendar, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, status } = useAuth();
  const { transactions, isLoading, error, reload, addTransaction } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status !== "idle" && status !== "loading" && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, status, router]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium text-slate-500">Cargando panel principal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentDateFormatted = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Calcular métricas dinámicas
  const totalIncome = transactions
    .filter((t) => String(t.type).toLowerCase() === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => String(t.type).toLowerCase() === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Encabezado del Dashboard */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              ¡Hola, {user?.name || "Usuario"}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Bienvenido al resumen de tus finanzas personales en Centavo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-500 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nueva Transacción</span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span className="capitalize">{currentDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Tarjetas de Métricas de Resumen */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Balance Total"
            amount={balance}
            description="Balance neto acumulado en todas tus cuentas"
            icon={Wallet}
            variant="emerald"
          />
          <StatCard
            title="Ingresos del Mes"
            amount={totalIncome}
            description="Total de entradas percibidas este periodo"
            icon={TrendingUp}
            variant="blue"
          />
          <StatCard
            title="Gastos del Mes"
            amount={totalExpense}
            description="Total de egresos registrados en este mes"
            icon={TrendingDown}
            variant="rose"
          />
        </div>

        {/* Sección Principal: Historial de Transacciones */}
        <section aria-labelledby="transactions-heading">
          <TransactionList
            transactions={transactions}
            isLoading={isLoading}
            error={error}
            onReload={reload}
            onAddTransaction={() => setIsModalOpen(true)}
          />
        </section>
      </main>

      {/* Modal para registrar nueva transacción */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await addTransaction(data);
        }}
      />
    </div>
  );
}
