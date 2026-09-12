import { Router } from 'express';
import { NotificationController } from '../controllers/notifications.controller.js';

/**
 * Crea y configura el router de notificaciones y alertas.
 *
 * POST  /api/notifications/events/transaction  → Recibir evento de transacción y evaluar sobregasto
 * POST  /api/notifications/evaluate            → Alias para evaluación directa de transacción
 * GET   /api/notifications                     → Listar notificaciones/alertas (filtros opcionales)
 * GET   /api/notifications/budgets             → Consultar presupuestos y consumo por categoría
 * PUT   /api/notifications/budgets/:category   → Configurar límite y umbral para una categoría
 * GET   /api/notifications/:id                 → Obtener detalle de una notificación por ID
 * PATCH /api/notifications/:id/read            → Marcar una notificación como leída
 */
export function createNotificationRouter(controller: NotificationController): Router {
  const router = Router();

  // Eventos y evaluación
  router.post('/events/transaction', controller.handleTransactionEvent);
  router.post('/evaluate', controller.handleTransactionEvent);

  // Gestión de presupuestos
  router.get('/budgets', controller.getAllBudgets);
  router.put('/budgets/:category', controller.updateBudget);

  // Consulta y gestión de notificaciones
  router.get('/', controller.findAllNotifications);
  router.get('/:id', controller.findById);
  router.patch('/:id/read', controller.markAsRead);

  return router;
}
