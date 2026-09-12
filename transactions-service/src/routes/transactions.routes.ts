import { Router } from 'express';
import { TransactionController } from '../controllers/transactions.controller.js';

/**
 * Crea y configura el router de transacciones.
 *
 * POST /api/transactions      → Crear una transacción
 * GET  /api/transactions      → Listar transacciones (con filtros opcionales)
 * GET  /api/transactions/:id  → Obtener una transacción por ID
 */
export function createTransactionRouter(controller: TransactionController): Router {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/:id', controller.findById);

  return router;
}
