import {
  TransactionCategory,
  TransactionType,
  AlertSeverity,
  NotificationType,
  type TransactionEvent,
  type Notification,
  type Budget,
  type EvaluationResult,
  type NotificationFilters,
} from '../models/notification.model.js';
import type { INotificationRepository } from '../repositories/notifications.repository.js';

/**
 * Capa de servicio para evaluación de sobregasto y gestión de notificaciones.
 */
export class NotificationService {
  constructor(private readonly repository: INotificationRepository) {}

  /**
   * Recibe un evento de transacción y determina si se debe generar una alerta de sobregasto.
   */
  evaluateTransaction(event: TransactionEvent): EvaluationResult {
    const budget = this.repository.getBudget(event.category);

    // Si es un ingreso, no computa contra el presupuesto de gastos
    if (event.type === TransactionType.INCOME) {
      const percentageSpent = Math.round((budget.currentSpent / budget.limit) * 10000) / 100;
      return {
        alertGenerated: false,
        budgetStatus: {
          category: event.category,
          limit: budget.limit,
          spent: budget.currentSpent,
          percentageSpent,
          remaining: Math.max(0, Math.round((budget.limit - budget.currentSpent) * 100) / 100),
          status: percentageSpent >= 100 ? 'EXCEEDED' : percentageSpent >= budget.warningThreshold * 100 ? 'WARNING' : 'OK',
        },
      };
    }

    // Actualizar gasto acumulado en el presupuesto
    const updatedBudget = this.repository.addSpending(event.category, event.amount);
    const spent = updatedBudget.currentSpent;
    const limit = updatedBudget.limit;
    const percentageSpent = Math.round((spent / limit) * 10000) / 100;
    const remaining = Math.max(0, Math.round((limit - spent) * 100) / 100);

    let alertGenerated = false;
    let notification: Notification | undefined;
    let status: 'OK' | 'WARNING' | 'EXCEEDED' = 'OK';

    if (spent >= limit) {
      status = 'EXCEEDED';
      alertGenerated = true;
      notification = this.repository.createNotification({
        type: NotificationType.BUDGET_EXCEEDED,
        severity: AlertSeverity.CRITICAL,
        title: `🚨 Presupuesto Excedido en ${event.category.toUpperCase()}`,
        message: `Has superado el 100% del presupuesto para "${event.category}". Gasto acumulado: $${spent.toFixed(2)} de un límite de $${limit.toFixed(2)} (${percentageSpent}%).`,
        category: event.category,
        transactionId: event.transactionId,
        budgetLimit: limit,
        currentSpent: spent,
        percentageSpent,
      });
    } else if (spent >= limit * updatedBudget.warningThreshold) {
      status = 'WARNING';
      alertGenerated = true;
      const thresholdPercent = Math.round(updatedBudget.warningThreshold * 100);
      notification = this.repository.createNotification({
        type: NotificationType.BUDGET_WARNING,
        severity: AlertSeverity.WARNING,
        title: `⚠️ Alerta de Consumo en ${event.category.toUpperCase()}`,
        message: `Has alcanzado el ${percentageSpent}% de tu presupuesto para "${event.category}" (umbral de advertencia: ${thresholdPercent}%). Gasto acumulado: $${spent.toFixed(2)} / $${limit.toFixed(2)}.`,
        category: event.category,
        transactionId: event.transactionId,
        budgetLimit: limit,
        currentSpent: spent,
        percentageSpent,
      });
    }

    return {
      alertGenerated,
      notification,
      budgetStatus: {
        category: event.category,
        limit,
        spent,
        percentageSpent,
        remaining,
        status,
      },
    };
  }

  findAllNotifications(filters?: NotificationFilters): { data: Notification[]; count: number } {
    const data = this.repository.findAllNotifications(filters);
    return { data, count: data.length };
  }

  findNotificationById(id: string): Notification | undefined {
    return this.repository.findNotificationById(id);
  }

  markNotificationAsRead(id: string): Notification | undefined {
    return this.repository.markAsRead(id);
  }

  getAllBudgets(): Budget[] {
    return this.repository.getAllBudgets();
  }

  getBudget(category: TransactionCategory): Budget {
    return this.repository.getBudget(category);
  }

  setBudget(category: TransactionCategory, limit: number, warningThreshold?: number): Budget {
    return this.repository.setBudget(category, limit, warningThreshold);
  }
}
