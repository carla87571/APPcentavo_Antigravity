import {
  TransactionCategory,
  BudgetPeriod,
  type CreateBudgetDTO,
  type UpdateBudgetDTO,
} from '../models/budget.model.js';

export interface ValidationError {
  field: string;
  message: string;
}

const VALID_CATEGORIES = Object.values(TransactionCategory);
const VALID_PERIODS = Object.values(BudgetPeriod);
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida el payload de creación de un presupuesto.
 */
export function validateCreateBudget(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'El cuerpo de la petición es requerido y debe ser un objeto JSON.' }];
  }

  const data = body as Record<string, unknown>;

  // category
  if (!data.category) {
    errors.push({ field: 'category', message: 'La categoría es requerida.' });
  } else if (!VALID_CATEGORIES.includes(data.category as TransactionCategory)) {
    errors.push({
      field: 'category',
      message: `Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}.`,
    });
  }

  // limit o amount (monto límite)
  const limitValue = data.limit !== undefined ? data.limit : data.amount;
  if (limitValue === undefined || limitValue === null) {
    errors.push({ field: 'limit', message: 'El monto límite es requerido (campo `limit` o `amount`).' });
  } else if (typeof limitValue !== 'number' || isNaN(limitValue)) {
    errors.push({ field: 'limit', message: 'El monto límite debe ser un número válido.' });
  } else if (limitValue <= 0) {
    errors.push({ field: 'limit', message: 'El monto límite debe ser mayor a 0.' });
  }

  // period
  if (!data.period) {
    errors.push({ field: 'period', message: 'El periodo es requerido (monthly, weekly, annual).' });
  } else if (!VALID_PERIODS.includes(data.period as BudgetPeriod)) {
    errors.push({
      field: 'period',
      message: `Periodo inválido. Valores permitidos: ${VALID_PERIODS.join(', ')}.`,
    });
  }

  // startDate (opcional)
  if (data.startDate !== undefined && data.startDate !== null) {
    if (typeof data.startDate !== 'string' || !ISO_DATE_REGEX.test(data.startDate)) {
      errors.push({ field: 'startDate', message: 'La fecha de inicio debe tener formato YYYY-MM-DD.' });
    }
  }

  // endDate (opcional)
  if (data.endDate !== undefined && data.endDate !== null) {
    if (typeof data.endDate !== 'string' || !ISO_DATE_REGEX.test(data.endDate)) {
      errors.push({ field: 'endDate', message: 'La fecha de fin debe tener formato YYYY-MM-DD.' });
    }
  }

  // warningThreshold (opcional)
  if (data.warningThreshold !== undefined && data.warningThreshold !== null) {
    if (
      typeof data.warningThreshold !== 'number' ||
      isNaN(data.warningThreshold) ||
      data.warningThreshold <= 0 ||
      data.warningThreshold > 1
    ) {
      errors.push({
        field: 'warningThreshold',
        message: 'El umbral de advertencia debe ser un valor decimal entre 0 y 1 (ej. 0.8 para 80%).',
      });
    }
  }

  return errors;
}

/**
 * Normaliza y extrae el DTO para crear presupuesto.
 */
export function toCreateBudgetDTO(body: Record<string, unknown>): CreateBudgetDTO {
  const limitValue = (body.limit !== undefined ? body.limit : body.amount) as number;
  return {
    category: body.category as TransactionCategory,
    limit: limitValue,
    period: body.period as BudgetPeriod,
    startDate: (body.startDate as string) || new Date().toISOString().split('T')[0],
    ...(body.endDate ? { endDate: body.endDate as string } : {}),
    warningThreshold: typeof body.warningThreshold === 'number' ? body.warningThreshold : 0.8,
  };
}

/**
 * Valida el payload de actualización de un presupuesto.
 */
export function validateUpdateBudget(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'El cuerpo de la petición es requerido y debe ser un objeto JSON.' }];
  }

  const data = body as Record<string, unknown>;

  const limitValue = data.limit !== undefined ? data.limit : data.amount;
  if (limitValue !== undefined && limitValue !== null) {
    if (typeof limitValue !== 'number' || isNaN(limitValue) || limitValue <= 0) {
      errors.push({ field: 'limit', message: 'El monto límite debe ser un número mayor a 0.' });
    }
  }

  if (data.period !== undefined && data.period !== null) {
    if (!VALID_PERIODS.includes(data.period as BudgetPeriod)) {
      errors.push({
        field: 'period',
        message: `Periodo inválido. Valores permitidos: ${VALID_PERIODS.join(', ')}.`,
      });
    }
  }

  if (data.warningThreshold !== undefined && data.warningThreshold !== null) {
    if (
      typeof data.warningThreshold !== 'number' ||
      isNaN(data.warningThreshold) ||
      data.warningThreshold <= 0 ||
      data.warningThreshold > 1
    ) {
      errors.push({
        field: 'warningThreshold',
        message: 'El umbral de advertencia debe ser un valor decimal entre 0 y 1.',
      });
    }
  }

  return errors;
}

/**
 * Normaliza y extrae el DTO de actualización.
 */
export function toUpdateBudgetDTO(body: Record<string, unknown>): UpdateBudgetDTO {
  const limitValue = body.limit !== undefined ? body.limit : body.amount;
  return {
    ...(limitValue !== undefined ? { limit: limitValue as number } : {}),
    ...(body.period ? { period: body.period as BudgetPeriod } : {}),
    ...(body.startDate ? { startDate: body.startDate as string } : {}),
    ...(body.endDate ? { endDate: body.endDate as string } : {}),
    ...(body.warningThreshold !== undefined ? { warningThreshold: body.warningThreshold as number } : {}),
  };
}

export { VALID_CATEGORIES, VALID_PERIODS };
