"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim() || !password.trim()) {
      setValidationError("Por favor completa todos los campos.");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setValidationError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const success = await login({ email, password });
    if (success) {
      router.push("/dashboard");
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@centavo.app");
    setPassword("centavo123");
    setValidationError(null);
  };

  const activeError = validationError || authError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 px-4 py-12 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
        
        {/* Header con branding */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-3xl shadow-lg shadow-emerald-600/30">
            🪙
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Iniciar sesión en Centavo
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gestiona tus finanzas personales y toma el control de tus gastos
          </p>
        </div>

        {/* Alerta de Error */}
        {activeError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              Correo Electrónico
            </label>
            <div className="relative mt-1.5 rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              Contraseña
            </label>
            <div className="relative mt-1.5 rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.99] transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Helper */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-center dark:border-emerald-950 dark:bg-emerald-950/30">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Acceso rápido de prueba</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Usa credenciales simuladas mientras el microservicio <code>auth-service</code> se inicializa.
          </p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Autocompletar demo (demo@centavo.app)
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          Centavo Monorepo • Frontend Dashboard Scaffold
        </div>
      </div>
    </div>
  );
}
