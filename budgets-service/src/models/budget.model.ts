/**
 * Modelos y tipos para el microservicio de presupuestos (budgets-service).
 */

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

export enum BudgetPeriod {
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  ANNUAL = 'annual',
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  limit: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
  warningThreshold: number; // Por defecto 0.8 (80%)
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDTO {
  category: TransactionCategory;
  limit: number;
  period: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  warningThreshold?: number;
}

export interface UpdateBudgetDTO {
  limit?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  warningThreshold?: number;
}

export interface BudgetFilters {
  category?: TransactionCategory;
  period?: BudgetPeriod;
}
