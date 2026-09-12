import {
  TransactionCategory,
  TransactionType,
  AlertSeverity,
} from '../models/notification.model.js';
import type { TransactionEvent } from '../models/notification.model.js';

export interface ValidationError {
  field: string;
  message: string;
}

const VALID_CATEGORIES = Object.values(TransactionCategory);
const VALID_TYPES = Object.values(TransactionType);
const VALID_SEVERITIES = Object.values(AlertSeverity);
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida el payload de un evento de transacción recibido para evaluación de alertas.
 */
export function validateTransactionEvent(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'El cuerpo de la petición es requerido y debe ser un objeto JSON.' }];
  }

  const data = body as Record<string, unknown>;

  // amount
  if (data.amount === undefined || data.amount === null) {
    errors.push({ field: 'amount', message: 'El monto de la transacción es requerido.' });
  } else if (typeof data.amount !== 'number' || isNaN(data.amount)) {
    errors.push({ field: 'amount', message: 'El monto debe ser un número válido.' });
  } else if (data.amount <= 0) {
    errors.push({ field: 'amount', message: 'El monto debe ser mayor a 0.' });
  }

  // category
  if (!data.category) {
    errors.push({ field: 'category', message: 'La categoría es requerida.' });
  } else if (!VALID_CATEGORIES.includes(data.category as TransactionCategory)) {
    errors.push({
      field: 'category',
      message: `Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}.`,
    });
  }

  // date (opcional, si no viene se asume hoy, pero si viene debe tener formato válido)
  if (data.date !== undefined && data.date !== null) {
    if (typeof data.date !== 'string' || !ISO_DATE_REGEX.test(data.date)) {
      errors.push({ field: 'date', message: 'La fecha debe tener formato YYYY-MM-DD.' });
    } else {
      const parsed = new Date(data.date);
      if (isNaN(parsed.getTime())) {
        errors.push({ field: 'date', message: 'La fecha proporcionada no es válida.' });
      }
    }
  }

  // type (opcional, por defecto 'expense')
  if (data.type !== undefined && data.type !== null) {
    if (!VALID_TYPES.includes(data.type as TransactionType)) {
      errors.push({
        field: 'type',
        message: `Tipo de transacción inválido. Valores permitidos: ${VALID_TYPES.join(', ')}.`,
      });
    }
  }

  // description (opcional)
  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    errors.push({ field: 'description', message: 'La descripción debe ser una cadena de texto.' });
  }

  // transactionId (opcional)
  if (data.transactionId !== undefined && data.transactionId !== null && typeof data.transactionId !== 'string') {
    errors.push({ field: 'transactionId', message: 'El ID de transacción debe ser un texto.' });
  }

  return errors;
}

/**
 * Normaliza y extrae el DTO del TransactionEvent.
 */
export function toTransactionEventDTO(body: Record<string, unknown>): TransactionEvent {
  return {
    amount: body.amount as number,
    category: body.category as TransactionCategory,
    date: (body.date as string) || new Date().toISOString().split('T')[0],
    type: (body.type as TransactionType) || TransactionType.EXPENSE,
    ...(body.transactionId ? { transactionId: body.transactionId as string } : {}),
    ...(body.description ? { description: body.description as string } : {}),
  };
}

/**
 * Valida la configuración o actualización de un presupuesto.
 */
export function validateBudgetUpdate(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'El cuerpo de la petición es requerido y debe ser un objeto JSON.' }];
  }

  const data = body as Record<string, unknown>;

  if (data.limit === undefined || data.limit === null) {
    errors.push({ field: 'limit', message: 'El límite de presupuesto es requerido.' });
  } else if (typeof data.limit !== 'number' || isNaN(data.limit) || data.limit <= 0) {
    errors.push({ field: 'limit', message: 'El límite debe ser un número mayor a 0.' });
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
        message: 'El umbral de advertencia debe ser un valor decimal entre 0 y 1 (ej. 0.8 para 80%).',
      });
    }
  }

  return errors;
}

export { VALID_CATEGORIES, VALID_TYPES, VALID_SEVERITIES };
