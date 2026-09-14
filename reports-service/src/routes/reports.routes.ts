import { Router } from 'express';
import { ReportController } from '../controllers/reports.controller.js';

/**
 * Crea y configura el router de reportes.
 *
 * POST   /api/reports/monthly/current → Generar reporte del mes actual bajo demanda
 * POST   /api/reports/monthly         → Generar reporte de un mes específico
 * GET    /api/reports                 → Listar reportes generados (?month=YYYY-MM)
 * GET    /api/reports/:id             → Obtener detalles JSON de un reporte
 * GET    /api/reports/:id/download    → Descargar el archivo físico del reporte
 * DELETE /api/reports/:id             → Eliminar un reporte y su archivo
 */
export function createReportRouter(controller: ReportController): Router {
  const router = Router();

  router.post('/monthly/current', controller.generateCurrentMonth);
  router.post('/monthly', controller.generateMonthly);
  router.get('/', controller.findAll);
  router.get('/:id', controller.findById);
  router.get('/:id/download', controller.downloadFile);
  router.delete('/:id', controller.delete);

  return router;
}
