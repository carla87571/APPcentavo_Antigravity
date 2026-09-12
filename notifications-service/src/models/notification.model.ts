/**
 * Modelos y tipos para el microservicio de notificaciones y alertas de sobregasto.
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

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum NotificationType {
  BUDGET_WARNING = 'budget_warning',
  BUDGET_EXCEEDED = 'budget_exceeded',
  SYSTEM = 'system',
}

/**
 * Evento de transacción recibido desde transactions-service o cliente.
 */
export interface TransactionEvent {
  transactionId?: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  type: TransactionType;
  description?: string;
}

/**
 * Representación de una notificación generada y persistida.
 */
export interface Notification {
  id: string;
  type: NotificationType;
  severity: AlertSeverity;
  title: string;
  message: string;
  category: TransactionCategory;
  transactionId?: string;
  budgetLimit: number;
  currentSpent: number;
  percentageSpent: number;
  read: boolean;
  createdAt: string;
}

/**
 * Presupuesto asociado a una categoría y seguimiento del consumo.
 */
export interface Budget {
  category: TransactionCategory;
  limit: number;
  warningThreshold: number; // Por defecto 0.8 (80%)
  currentSpent: number;
  updatedAt: string;
}

/**
 * Resultado de evaluar una transacción contra el presupuesto.
 */
export interface EvaluationResult {
  alertGenerated: boolean;
  notification?: Notification;
  budgetStatus: {
    category: TransactionCategory;
    limit: number;
    spent: number;
    percentageSpent: number;
    remaining: number;
    status: 'OK' | 'WARNING' | 'EXCEEDED';
  };
}

/**
 * Filtros para consulta de notificaciones.
 */
export interface NotificationFilters {
  category?: TransactionCategory;
  severity?: AlertSeverity;
  unreadOnly?: boolean;
}
