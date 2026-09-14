import type { GenerateReportDTO, ReportFilters } from '../models/report.model.js';

export interface ValidationError {
  field: string;
  message: string;
}

export const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Obtiene el identificador del mes actual en formato YYYY-MM según la fecha local/UTC.
 */
export function getCurrentMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Obtiene la fecha inicial y final (en formato YYYY-MM-DD) para un mes YYYY-MM.
 */
export function getMonthDateRange(monthString: string): { startDate: string; endDate: string } {
  const [yearStr, monthStr] = monthString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Primer día del mes
  const startDate = `${monthString}-01`;

  // Último día del mes: día 0 del mes siguiente
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${monthString}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

/**
 * Valida el payload de generación de reporte mensual.
 */
export function validateGenerateReport(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (body === undefined || body === null || Object.keys(body).length === 0) {
    // Es válido enviar body vacío o undefined para generar el mes actual
    return errors;
  }

  if (typeof body !== 'object') {
    return [{ field: 'body', message: 'El cuerpo de la petición debe ser un objeto JSON.' }];
  }

  const data = body as Record<string, unknown>;

  if (data.month !== undefined && data.month !== null) {
    if (typeof data.month !== 'string' || !MONTH_REGEX.test(data.month)) {
      errors.push({
        field: 'month',
        message: 'El mes debe tener un formato válido YYYY-MM (por ejemplo: 2026-09).',
      });
    }
  }

  return errors;
}

/**
 * Extrae y normaliza el DTO para generar reporte.
 */
export function toGenerateReportDTO(body: unknown): GenerateReportDTO {
  if (!body || typeof body !== 'object') {
    return { month: getCurrentMonthString() };
  }

  const data = body as Record<string, unknown>;
  return {
    month: typeof data.month === 'string' && data.month ? data.month : getCurrentMonthString(),
  };
}

/**
 * Valida filtros de búsqueda de reportes en query params.
 */
export function validateReportFilters(query: Record<string, unknown>): { errors: ValidationError[]; filters: ReportFilters } {
  const errors: ValidationError[] = [];
  const filters: ReportFilters = {};

  if (query.month) {
    const month = String(query.month);
    if (!MONTH_REGEX.test(month)) {
      errors.push({
        field: 'month',
        message: 'El parámetro month debe tener formato YYYY-MM (por ejemplo: 2026-09).',
      });
    } else {
      filters.month = month;
    }
  }

  return { errors, filters };
}
