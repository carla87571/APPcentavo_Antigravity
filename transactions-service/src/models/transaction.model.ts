/**
 * Modelo y tipos para transacciones financieras.
 *
 * Define la estructura de datos central del servicio: cada transacción
 * representa un movimiento financiero (gasto o ingreso) con monto,
 * categoría, fecha y descripción opcional.
 */

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  ALIMENTACION = 'alimentacion',
  TRANSPORTE = 'transporte',
  OCIO = 'ocio',
  SERVICIOS = 'servicios',
  SALUD = 'salud',
  EDUCACION = 'educacion',
  VIVIENDA = 'vivienda',
  OTROS = 'otros',
}

export interface Transaction {
  id: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  description?: string;
  type: TransactionType;
  createdAt: string;
}

/** Payload para crear una transacción (sin campos autogenerados). */
export interface CreateTransactionDTO {
  amount: number;
  category: TransactionCategory;
  date: string;
  description?: string;
  type: TransactionType;
}

/** Query params para filtrar transacciones en el listado. */
export interface TransactionFilters {
  category?: TransactionCategory;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}
