import {
  TransactionCategory,
  type Budget,
  type CreateBudgetDTO,
  type UpdateBudgetDTO,
  type BudgetFilters,
} from '../models/budget.model.js';
import type { IBudgetRepository } from '../repositories/budgets.repository.js';

/**
 * Capa de servicio para lógica de negocio de presupuestos.
 */
export class BudgetService {
  constructor(private readonly repository: IBudgetRepository) {}

  /**
   * Crea un nuevo presupuesto o actualiza el existente si ya hay uno configurado para la categoría.
   */
  create(dto: CreateBudgetDTO): Budget {
    const existing = this.repository.findByCategory(dto.category);
    if (existing) {
      // Si ya existe un presupuesto para esa categoría, se actualiza el límite y periodo
      return this.repository.update(existing.id, {
        limit: dto.limit,
        period: dto.period,
        startDate: dto.startDate,
        endDate: dto.endDate,
        warningThreshold: dto.warningThreshold,
      })!;
    }
    return this.repository.create(dto);
  }

  findAll(filters?: BudgetFilters): { data: Budget[]; count: number } {
    const data = this.repository.findAll(filters);
    return { data, count: data.length };
  }

  findById(id: string): Budget | undefined {
    return this.repository.findById(id);
  }

  findByCategory(category: TransactionCategory): Budget | undefined {
    return this.repository.findByCategory(category);
  }

  update(id: string, dto: UpdateBudgetDTO): Budget | undefined {
    return this.repository.update(id, dto);
  }

  delete(id: string): boolean {
    return this.repository.delete(id);
  }
}
