/**
 * Modelos y tipos para el microservicio de reportes (reports-service).
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

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum BudgetStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  EXCEEDED = 'EXCEEDED',
  NO_BUDGET = 'NO_BUDGET',
}

/** Transacción recibida desde transactions-service */
export interface ExternalTransaction {
  id: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  description?: string;
  type: TransactionType;
  createdAt: string;
}

/** Presupuesto recibido desde budgets-service */
export interface ExternalBudget {
  id: string;
  category: TransactionCategory;
  limit: number;
  period: string;
  startDate: string;
  endDate?: string;
  warningThreshold: number;
  createdAt: string;
  updatedAt: string;
}

/** Desglose por categoría en el reporte mensual */
export interface CategoryReportBreakdown {
  category: string;
  spent: number;
  budgetLimit: number | null;
  remainingBudget: number | null;
  percentageBudgetConsumed: number | null;
  status: BudgetStatus;
  transactionCount: number;
}

/** Categoría con mayor nivel de gasto */
export interface TopSpendingCategory {
  category: string;
  spent: number;
  percentageOfTotalExpenses: number;
}

/** Métricas consolidadas del reporte */
export interface MonthlyReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // Porcentaje: (netSavings / totalIncome) * 100
  totalTransactions: number;
  totalExpenseTransactions: number;
  totalIncomeTransactions: number;
  totalBudgeted: number;
  budgetUtilizationRate: number; // (totalExpenses / totalBudgeted) * 100
}

/** Información del archivo persistido en disco */
export interface ReportFileMetadata {
  fileName: string;
  filePath: string;
  fileFormat: string;
  fileSizeBytes: number;
  downloadUrl: string;
}

/** Entidad principal del reporte mensual */
export interface MonthlyReport {
  id: string;
  month: string; // Formato YYYY-MM
  startDate: string; // Formato YYYY-MM-DD
  endDate: string; // Formato YYYY-MM-DD
  title: string;
  generatedAt: string;
  summary: MonthlyReportSummary;
  categories: CategoryReportBreakdown[];
  topCategories: TopSpendingCategory[];
  alerts: string[];
  file: ReportFileMetadata;
}

/** DTO para solicitar la generación de un reporte */
export interface GenerateReportDTO {
  month?: string; // Opcional, por defecto mes actual
}

/** Filtros para consultar reportes generados */
export interface ReportFilters {
  month?: string;
}
