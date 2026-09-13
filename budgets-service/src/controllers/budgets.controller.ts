import type { Request, Response, NextFunction } from 'express';
import type { BudgetService } from '../services/budgets.service.js';
import {
  TransactionCategory,
  BudgetPeriod,
  type BudgetFilters,
} from '../models/budget.model.js';
import {
  validateCreateBudget,
  toCreateBudgetDTO,
  validateUpdateBudget,
  toUpdateBudgetDTO,
} from '../utils/validation.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Controller del microservicio de presupuestos.
 * Manejo HTTP, validación y formateo de respuestas.
 */
export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  /**
   * Crea un nuevo presupuesto.
   * POST /api/budgets
   */
  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors = validateCreateBudget(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const dto = toCreateBudgetDTO(req.body);
      const budget = this.service.create(dto);

      res.status(201).json({
        success: true,
        data: budget,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Consulta todos los presupuestos con filtros opcionales.
   * GET /api/budgets
   */
  findAll = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const filters: BudgetFilters = {};

      if (req.query.category) {
        const cat = req.query.category as string;
        if (!Object.values(TransactionCategory).includes(cat as TransactionCategory)) {
          throw new AppError(400, `Categoría de filtro inválida: ${cat}`);
        }
        filters.category = cat as TransactionCategory;
      }

      if (req.query.period) {
        const per = req.query.period as string;
        if (!Object.values(BudgetPeriod).includes(per as BudgetPeriod)) {
          throw new AppError(400, `Periodo de filtro inválido: ${per}`);
        }
        filters.period = per as BudgetPeriod;
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
   * Obtiene un presupuesto por su ID.
   * GET /api/budgets/:id
   */
  findById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const budget = this.service.findById(id);

      if (!budget) {
        throw new AppError(404, `Presupuesto con id '${id}' no encontrado.`);
      }

      res.status(200).json({
        success: true,
        data: budget,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Obtiene un presupuesto por su categoría.
   * GET /api/budgets/category/:category
   */
  findByCategory = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const cat = req.params.category as string;
      if (!Object.values(TransactionCategory).includes(cat as TransactionCategory)) {
        throw new AppError(400, `Categoría inválida: ${cat}`);
      }

      const budget = this.service.findByCategory(cat as TransactionCategory);
      if (!budget) {
        throw new AppError(404, `No se encontró presupuesto activo para la categoría '${cat}'.`);
      }

      res.status(200).json({
        success: true,
        data: budget,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Actualiza un presupuesto existente.
   * PUT /api/budgets/:id
   */
  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const errors = validateUpdateBudget(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const dto = toUpdateBudgetDTO(req.body);
      const updated = this.service.update(id, dto);

      if (!updated) {
        throw new AppError(404, `Presupuesto con id '${id}' no encontrado.`);
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
   * Elimina un presupuesto por su ID.
   * DELETE /api/budgets/:id
   */
  delete = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const deleted = this.service.delete(id);

      if (!deleted) {
        throw new AppError(404, `Presupuesto con id '${id}' no encontrado.`);
      }

      res.status(200).json({
        success: true,
        message: `Presupuesto '${id}' eliminado con éxito.`,
      });
    } catch (err) {
      next(err);
    }
  };
}
