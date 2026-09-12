import {
  TransactionCategory,
  TransactionType,
} from '../models/transaction.model.js';
import type { CreateTransactionDTO } from '../models/transaction.model.js';

export interface ValidationError {
  field: string;
  message: string;
}

const VALID_CATEGORIES = Object.values(TransactionCategory);
const VALID_TYPES = Object.values(TransactionType);
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida el payload de creación de una transacción.
 * Retorna un array vacío si todo es válido, o una lista de errores.
 */
export function validateCreateTransaction(
  body: unknown,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'El cuerpo de la petición es requerido y debe ser un objeto JSON.' }];
  }

  const data = body as Record<string, unknown>;

  // amount
  if (data.amount === undefined || data.amount === null) {
    errors.push({ field: 'amount', message: 'El monto es requerido.' });
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

  // date
  if (!data.date) {
    errors.push({ field: 'date', message: 'La fecha es requerida.' });
  } else if (typeof data.date !== 'string' || !ISO_DATE_REGEX.test(data.date)) {
    errors.push({ field: 'date', message: 'La fecha debe tener formato YYYY-MM-DD.' });
  } else {
    const parsed = new Date(data.date);
    if (isNaN(parsed.getTime())) {
      errors.push({ field: 'date', message: 'La fecha no es válida.' });
    }
  }

  // type
  if (!data.type) {
    errors.push({ field: 'type', message: 'El tipo es requerido (income o expense).' });
  } else if (!VALID_TYPES.includes(data.type as TransactionType)) {
    errors.push({
      field: 'type',
      message: `Tipo inválido. Valores permitidos: ${VALID_TYPES.join(', ')}.`,
    });
  }

  // description (opcional, pero si viene debe ser string)
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push({ field: 'description', message: 'La descripción debe ser un texto.' });
  }

  return errors;
}

/**
 * Extrae un DTO limpio a partir del body ya validado.
 */
export function toCreateTransactionDTO(body: Record<string, unknown>): CreateTransactionDTO {
  return {
    amount: body.amount as number,
    category: body.category as TransactionCategory,
    date: body.date as string,
    type: body.type as TransactionType,
    ...(body.description ? { description: body.description as string } : {}),
  };
}
