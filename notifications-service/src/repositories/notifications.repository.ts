import { v4 as uuidv4 } from 'uuid';
import {
  TransactionCategory,
  type Notification,
  type Budget,
  type NotificationFilters,
} from '../models/notification.model.js';

/**
 * Contrato del repositorio de notificaciones y seguimiento de presupuestos.
 */
export interface INotificationRepository {
  // Notificaciones
  createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification;
  findAllNotifications(filters?: NotificationFilters): Notification[];
  findNotificationById(id: string): Notification | undefined;
  markAsRead(id: string): Notification | undefined;

  // Presupuestos
  getBudget(category: TransactionCategory): Budget;
  getAllBudgets(): Budget[];
  setBudget(category: TransactionCategory, limit: number, warningThreshold?: number): Budget;
  addSpending(category: TransactionCategory, amount: number): Budget;
  resetSpending(category?: TransactionCategory): void;
}

/**
 * Presupuestos base predeterminados por categoría.
 */
const DEFAULT_BUDGETS: Record<TransactionCategory, { limit: number; warningThreshold: number; currentSpent: number }> = {
  [TransactionCategory.ALIMENTACION]: { limit: 500, warningThreshold: 0.8, currentSpent: 0 },
  [TransactionCategory.TRANSPORTE]: { limit: 200, warningThreshold: 0.8, currentSpent: 0 },
  [TransactionCategory.OCIO]: { limit: 150, warningThreshold: 0.8, currentSpent: 0 },
  [TransactionCategory.SERVICIOS]: { limit: 300, warningThreshold: 0.8, currentSpent: 0 },
  [TransactionCategory.SALUD]: { limit: 250, warningThreshold: 0.8, currentSpent: 0 },
  [TransactionCategory.EDUCACION]: { limit: 400, warningThreshold: 0.8, currentSpent: 0 },
  [TransactionCategory.VIVIENDA]: { limit: 800, warningThreshold: 0.8, currentSpent: 0 },
  [TransactionCategory.OTROS]: { limit: 100, warningThreshold: 0.8, currentSpent: 0 },
};

/**
 * Implementación en memoria del repositorio de notificaciones y presupuestos.
 */
export class InMemoryNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = [];
  private budgets: Map<TransactionCategory, Budget> = new Map();

  constructor() {
    this.seedDefaultBudgets();
  }

  private seedDefaultBudgets(): void {
    const now = new Date().toISOString();
    for (const [cat, data] of Object.entries(DEFAULT_BUDGETS)) {
      this.budgets.set(cat as TransactionCategory, {
        category: cat as TransactionCategory,
        limit: data.limit,
        warningThreshold: data.warningThreshold,
        currentSpent: data.currentSpent,
        updatedAt: now,
      });
    }
  }

  createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const notification: Notification = {
      id: uuidv4(),
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.push(notification);
    return notification;
  }

  findAllNotifications(filters?: NotificationFilters): Notification[] {
    let results = [...this.notifications];

    if (filters?.category) {
      results = results.filter((n) => n.category === filters.category);
    }

    if (filters?.severity) {
      results = results.filter((n) => n.severity === filters.severity);
    }

    if (filters?.unreadOnly) {
      results = results.filter((n) => !n.read);
    }

    // Orden cronológico descendente (más recientes primero)
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findNotificationById(id: string): Notification | undefined {
    return this.notifications.find((n) => n.id === id);
  }

  markAsRead(id: string): Notification | undefined {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return notification;
  }

  getBudget(category: TransactionCategory): Budget {
    const existing = this.budgets.get(category);
    if (existing) {
      return existing;
    }
    const defaultBudget: Budget = {
      category,
      limit: 300,
      warningThreshold: 0.8,
      currentSpent: 0,
      updatedAt: new Date().toISOString(),
    };
    this.budgets.set(category, defaultBudget);
    return defaultBudget;
  }

  getAllBudgets(): Budget[] {
    return Array.from(this.budgets.values());
  }

  setBudget(category: TransactionCategory, limit: number, warningThreshold = 0.8): Budget {
    const current = this.getBudget(category);
    const updated: Budget = {
      ...current,
      limit,
      warningThreshold,
      updatedAt: new Date().toISOString(),
    };
    this.budgets.set(category, updated);
    return updated;
  }

  addSpending(category: TransactionCategory, amount: number): Budget {
    const budget = this.getBudget(category);
    budget.currentSpent = Math.round((budget.currentSpent + amount) * 100) / 100;
    budget.updatedAt = new Date().toISOString();
    this.budgets.set(category, budget);
    return budget;
  }

  resetSpending(category?: TransactionCategory): void {
    if (category) {
      const b = this.budgets.get(category);
      if (b) {
        b.currentSpent = 0;
        b.updatedAt = new Date().toISOString();
      }
    } else {
      for (const b of this.budgets.values()) {
        b.currentSpent = 0;
        b.updatedAt = new Date().toISOString();
      }
    }
  }
}
