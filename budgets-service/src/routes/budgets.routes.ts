import { Router } from 'express';
import { BudgetController } from '../controllers/budgets.controller.js';

/**
 * Crea y configura el router de presupuestos.
 *
 * POST   /api/budgets                    → Crear un presupuesto
 * GET    /api/budgets                    → Listar presupuestos (con filtros opcionales ?category=&period=)
 * GET    /api/budgets/category/:category → Obtener presupuesto por categoría
 * GET    /api/budgets/:id                → Obtener presupuesto por ID
 * PUT    /api/budgets/:id                → Actualizar presupuesto
 * DELETE /api/budgets/:id                → Eliminar presupuesto
 */
export function createBudgetRouter(controller: BudgetController): Router {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/category/:category', controller.findByCategory);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
