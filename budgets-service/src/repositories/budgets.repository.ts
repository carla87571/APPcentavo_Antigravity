import { v4 as uuidv4 } from 'uuid';
import {
  TransactionCategory,
  BudgetPeriod,
  type Budget,
  type CreateBudgetDTO,
  type UpdateBudgetDTO,
  type BudgetFilters,
} from '../models/budget.model.js';

/**
 * Contrato del repositorio de presupuestos.
 */
export interface IBudgetRepository {
  create(dto: CreateBudgetDTO): Budget;
  findAll(filters?: BudgetFilters): Budget[];
  findById(id: string): Budget | undefined;
  findByCategory(category: TransactionCategory): Budget | undefined;
  update(id: string, dto: UpdateBudgetDTO): Budget | undefined;
  delete(id: string): boolean;
}

/**
 * Presupuestos semilla predeterminados para inicio de la app.
 */
const INITIAL_BUDGETS: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    category: TransactionCategory.ALIMENTACION,
    limit: 500,
    period: BudgetPeriod.MONTHLY,
    startDate: '2026-09-01',
    warningThreshold: 0.8,
  },
  {
    category: TransactionCategory.TRANSPORTE,
    limit: 200,
    period: BudgetPeriod.MONTHLY,
    startDate: '2026-09-01',
    warningThreshold: 0.8,
  },
  {
    category: TransactionCategory.OCIO,
    limit: 150,
    period: BudgetPeriod.MONTHLY,
    startDate: '2026-09-01',
    warningThreshold: 0.8,
  },
];

/**
 * Implementación in-memory del repositorio de presupuestos.
 */
export class InMemoryBudgetRepository implements IBudgetRepository {
  private budgets: Budget[] = [];

  constructor() {
    this.seedInitialBudgets();
  }

  private seedInitialBudgets(): void {
    const now = new Date().toISOString();
    for (const item of INITIAL_BUDGETS) {
      this.budgets.push({
        id: uuidv4(),
        ...item,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  create(dto: CreateBudgetDTO): Budget {
    const now = new Date().toISOString();
    const budget: Budget = {
      id: uuidv4(),
      category: dto.category,
      limit: dto.limit,
      period: dto.period,
      startDate: dto.startDate || now.split('T')[0],
      ...(dto.endDate ? { endDate: dto.endDate } : {}),
      warningThreshold: dto.warningThreshold !== undefined ? dto.warningThreshold : 0.8,
      createdAt: now,
      updatedAt: now,
    };
    this.budgets.push(budget);
    return budget;
  }

  findAll(filters?: BudgetFilters): Budget[] {
    let results = [...this.budgets];

    if (filters?.category) {
      results = results.filter((b) => b.category === filters.category);
    }

    if (filters?.period) {
      results = results.filter((b) => b.period === filters.period);
    }

    // Ordenar por fecha de actualización descendente
    return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  findById(id: string): Budget | undefined {
    return this.budgets.find((b) => b.id === id);
  }

  findByCategory(category: TransactionCategory): Budget | undefined {
    return this.budgets.find((b) => b.category === category);
  }

  update(id: string, dto: UpdateBudgetDTO): Budget | undefined {
    const budget = this.findById(id);
    if (!budget) return undefined;

    if (dto.limit !== undefined) budget.limit = dto.limit;
    if (dto.period !== undefined) budget.period = dto.period;
    if (dto.startDate !== undefined) budget.startDate = dto.startDate;
    if (dto.endDate !== undefined) budget.endDate = dto.endDate;
    if (dto.warningThreshold !== undefined) budget.warningThreshold = dto.warningThreshold;

    budget.updatedAt = new Date().toISOString();
    return budget;
  }

  delete(id: string): boolean {
    const index = this.budgets.findIndex((b) => b.id === id);
    if (index === -1) return false;
    this.budgets.splice(index, 1);
    return true;
  }
}
