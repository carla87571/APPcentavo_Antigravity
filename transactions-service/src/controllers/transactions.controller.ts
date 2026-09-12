import type { Request, Response, NextFunction } from 'express';
import type { TransactionService } from '../services/transactions.service.js';
import type { TransactionFilters } from '../models/transaction.model.js';
import { TransactionCategory, TransactionType } from '../models/transaction.model.js';
import { validateCreateTransaction, toCreateTransactionDTO } from '../utils/validation.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Controller de transacciones.
 *
 * Responsabilidades: extraer datos del request, validar, delegar al
 * service, y formatear la respuesta HTTP. No contiene lógica de negocio.
 */
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors = validateCreateTransaction(req.body);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          errors,
        });
        return;
      }

      const dto = toCreateTransactionDTO(req.body);
      const transaction = this.service.create(dto);

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  };

  findAll = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const filters: TransactionFilters = {};

      if (req.query.category) {
        const cat = req.query.category as string;
        if (!Object.values(TransactionCategory).includes(cat as TransactionCategory)) {
          throw new AppError(400, `Categoría de filtro inválida: ${cat}`);
        }
        filters.category = cat as TransactionCategory;
      }

      if (req.query.type) {
        const type = req.query.type as string;
        if (!Object.values(TransactionType).includes(type as TransactionType)) {
          throw new AppError(400, `Tipo de filtro inválido: ${type}`);
        }
        filters.type = type as TransactionType;
      }

      if (req.query.startDate) {
        filters.startDate = req.query.startDate as string;
      }

      if (req.query.endDate) {
        filters.endDate = req.query.endDate as string;
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

  findById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const transaction = this.service.findById(id);

      if (!transaction) {
        throw new AppError(404, `Transacción con id '${id}' no encontrada.`);
      }

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  };
}
