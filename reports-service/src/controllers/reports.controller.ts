import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import type { ReportService } from '../services/reports.service.js';
import {
  validateGenerateReport,
  toGenerateReportDTO,
  validateReportFilters,
  getCurrentMonthString,
} from '../utils/validation.js';
import { AppError } from '../middlewares/errorHandler.js';

export class ReportController {
  constructor(private readonly service: ReportService) {}

  /**
   * Genera el reporte mensual del mes actual bajo demanda.
   * POST /api/reports/monthly/current
   */
  generateCurrentMonth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentMonth = getCurrentMonthString();
      const report = await this.service.generateMonthlyReport({ month: currentMonth });

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Genera el reporte mensual para un mes específico o el mes actual.
   * POST /api/reports/monthly
   */
  generateMonthly = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validateGenerateReport(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const dto = toGenerateReportDTO(req.body);
      const report = await this.service.generateMonthlyReport(dto);

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Consulta todos los reportes generados con filtros opcionales.
   * GET /api/reports
   */
  findAll = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { errors, filters } = validateReportFilters(req.query as Record<string, unknown>);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const result = this.service.findAll(filters);

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
   * Obtiene los datos de un reporte por su ID.
   * GET /api/reports/:id
   */
  findById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const report = this.service.findById(id);

      if (!report) {
        throw new AppError(404, `Reporte con id '${id}' no encontrado.`);
      }

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Descarga el archivo persistido del reporte generado.
   * GET /api/reports/:id/download
   */
  downloadFile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const fileInfo = this.service.getReportFilePath(id);

      if (!fileInfo) {
        throw new AppError(404, `Reporte con id '${id}' no encontrado.`);
      }

      if (!fs.existsSync(fileInfo.filePath)) {
        throw new AppError(404, `El archivo físico '${fileInfo.fileName}' no existe en disco.`);
      }

      res.setHeader('Content-Type', fileInfo.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
      res.download(fileInfo.filePath, fileInfo.fileName);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Elimina un reporte por su ID y remueve su archivo del disco.
   * DELETE /api/reports/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const deleted = await this.service.delete(id);

      if (!deleted) {
        throw new AppError(404, `Reporte con id '${id}' no encontrado.`);
      }

      res.status(200).json({
        success: true,
        message: `Reporte '${id}' y su archivo fueron eliminados con éxito.`,
      });
    } catch (err) {
      next(err);
    }
  };
}
