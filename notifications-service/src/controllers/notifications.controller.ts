import type { Request, Response, NextFunction } from 'express';
import type { NotificationService } from '../services/notifications.service.js';
import {
  TransactionCategory,
  AlertSeverity,
  type NotificationFilters,
} from '../models/notification.model.js';
import {
  validateTransactionEvent,
  toTransactionEventDTO,
  validateBudgetUpdate,
} from '../utils/validation.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Controller del microservicio de notificaciones.
 * Responsabilidades: manejo HTTP, validación de entrada y formateo de respuestas.
 */
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  /**
   * Endpoint receptor de eventos de transacciones para evaluar sobregasto.
   * POST /api/notifications/events/transaction
   */
  handleTransactionEvent = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors = validateTransactionEvent(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const event = toTransactionEventDTO(req.body);
      const result = this.service.evaluateTransaction(event);

      res.status(200).json({
        success: true,
        alertGenerated: result.alertGenerated,
        data: {
          notification: result.notification || null,
          budgetStatus: result.budgetStatus,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Lista el historial de notificaciones con filtros opcionales.
   * GET /api/notifications
   */
  findAllNotifications = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const filters: NotificationFilters = {};

      if (req.query.category) {
        const cat = req.query.category as string;
        if (!Object.values(TransactionCategory).includes(cat as TransactionCategory)) {
          throw new AppError(400, `Categoría de filtro inválida: ${cat}`);
        }
        filters.category = cat as TransactionCategory;
      }

      if (req.query.severity) {
        const sev = req.query.severity as string;
        if (!Object.values(AlertSeverity).includes(sev as AlertSeverity)) {
          throw new AppError(400, `Severidad de filtro inválida: ${sev}`);
        }
        filters.severity = sev as AlertSeverity;
      }

      if (req.query.unreadOnly !== undefined) {
        filters.unreadOnly = req.query.unreadOnly === 'true';
      }

      const result = this.service.findAllNotifications(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        count: result.count,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Obtiene una notificación por su ID.
   * GET /api/notifications/:id
   */
  findById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const notification = this.service.findNotificationById(id);

      if (!notification) {
        throw new AppError(404, `Notificación con id '${id}' no encontrada.`);
      }

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Marca una notificación como leída.
   * PATCH /api/notifications/:id/read
   */
  markAsRead = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const updated = this.service.markNotificationAsRead(id);

      if (!updated) {
        throw new AppError(404, `Notificación con id '${id}' no encontrada.`);
      }

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Lista todos los presupuestos actuales por categoría.
   * GET /api/notifications/budgets
   */
  getAllBudgets = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const budgets = this.service.getAllBudgets();
      res.status(200).json({
        success: true,
        data: budgets,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Actualiza o configura el límite de presupuesto para una categoría.
   * PUT /api/notifications/budgets/:category
   */
  updateBudget = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const category = req.params.category as TransactionCategory;
      if (!Object.values(TransactionCategory).includes(category)) {
        throw new AppError(400, `Categoría inválida: ${category}`);
      }

      const errors = validateBudgetUpdate(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const { limit, warningThreshold } = req.body;
      const updated = this.service.setBudget(category, limit, warningThreshold);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };
}
