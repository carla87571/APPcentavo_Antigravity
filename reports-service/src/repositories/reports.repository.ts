import type { MonthlyReport, ReportFilters } from '../models/report.model.js';

/**
 * Contrato del repositorio de reportes.
 */
export interface IReportRepository {
  save(report: MonthlyReport): MonthlyReport;
  findAll(filters?: ReportFilters): MonthlyReport[];
  findById(id: string): MonthlyReport | undefined;
  findByMonth(month: string): MonthlyReport | undefined;
  delete(id: string): boolean;
}

/**
 * Implementación in-memory del repositorio de reportes.
 */
export class InMemoryReportRepository implements IReportRepository {
  private reports: MonthlyReport[] = [];

  save(report: MonthlyReport): MonthlyReport {
    // Si ya existe un reporte para ese id, lo actualizamos; si no, lo agregamos
    const existingIndex = this.reports.findIndex((r) => r.id === report.id);
    if (existingIndex >= 0) {
      this.reports[existingIndex] = report;
    } else {
      this.reports.push(report);
    }
    return report;
  }

  findAll(filters?: ReportFilters): MonthlyReport[] {
    let results = [...this.reports];

    if (filters?.month) {
      results = results.filter((r) => r.month === filters.month);
    }

    // Ordenar de más reciente a más antiguo por fecha de generación
    return results.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }

  findById(id: string): MonthlyReport | undefined {
    return this.reports.find((r) => r.id === id);
  }

  findByMonth(month: string): MonthlyReport | undefined {
    return this.reports.find((r) => r.month === month);
  }

  delete(id: string): boolean {
    const index = this.reports.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.reports.splice(index, 1);
    return true;
  }
}
