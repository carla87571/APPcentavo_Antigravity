import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  TransactionCategory,
  TransactionType,
  BudgetStatus,
  type MonthlyReport,
  type GenerateReportDTO,
  type ReportFilters,
  type ExternalTransaction,
  type ExternalBudget,
  type CategoryReportBreakdown,
  type TopSpendingCategory,
} from '../models/report.model.js';
import type { IReportRepository } from '../repositories/reports.repository.js';
import type { ITransactionsClient } from './clients/transactions.client.js';
import type { IBudgetsClient } from './clients/budgets.client.js';
import { getCurrentMonthString, getMonthDateRange } from '../utils/validation.js';

export class ReportService {
  constructor(
    private readonly repository: IReportRepository,
    private readonly transactionsClient: ITransactionsClient,
    private readonly budgetsClient: IBudgetsClient,
    private readonly reportsDir: string,
  ) {}

  /**
   * Genera el reporte mensual agregando datos de transactions-service y budgets-service,
   * y guarda el resultado como un archivo físico en disco accesible posteriormente.
   */
  async generateMonthlyReport(dto?: GenerateReportDTO): Promise<MonthlyReport> {
    const month = dto?.month || getCurrentMonthString();
    const { startDate, endDate } = getMonthDateRange(month);

    // 1. Obtener datos concurrentemente de transactions-service y budgets-service
    const [transactions, budgets] = await Promise.all([
      this.transactionsClient.getTransactions(startDate, endDate),
      this.budgetsClient.getBudgets(),
    ]);

    // 2. Procesar transacciones
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalIncomeTransactions = 0;
    let totalExpenseTransactions = 0;

    const expensesByCategory: Record<string, { spent: number; count: number }> = {};

    for (const tx of transactions) {
      if (tx.type === TransactionType.INCOME) {
        totalIncome += tx.amount;
        totalIncomeTransactions += 1;
      } else {
        totalExpenses += tx.amount;
        totalExpenseTransactions += 1;

        if (!expensesByCategory[tx.category]) {
          expensesByCategory[tx.category] = { spent: 0, count: 0 };
        }
        expensesByCategory[tx.category].spent += tx.amount;
        expensesByCategory[tx.category].count += 1;
      }
    }

    // 3. Mapear presupuestos
    const budgetsByCategory = new Map<string, ExternalBudget>();
    let totalBudgeted = 0;

    for (const b of budgets) {
      budgetsByCategory.set(b.category, b);
      totalBudgeted += b.limit;
    }

    // 4. Consolidar categorías (todas las que tuvieron gasto o tienen presupuesto configurado)
    const allCategoriesSet = new Set<string>([
      ...Object.values(TransactionCategory),
      ...Object.keys(expensesByCategory),
      ...budgets.map((b) => b.category),
    ]);

    const categories: CategoryReportBreakdown[] = [];
    const alerts: string[] = [];

    for (const cat of allCategoriesSet) {
      const expData = expensesByCategory[cat] || { spent: 0, count: 0 };
      const budget = budgetsByCategory.get(cat);

      const spent = Math.round(expData.spent * 100) / 100;
      let budgetLimit: number | null = null;
      let remainingBudget: number | null = null;
      let percentageBudgetConsumed: number | null = null;
      let status: BudgetStatus = BudgetStatus.NO_BUDGET;

      if (budget) {
        budgetLimit = budget.limit;
        remainingBudget = Math.max(0, Math.round((budget.limit - spent) * 100) / 100);
        percentageBudgetConsumed = budget.limit > 0 ? Math.round((spent / budget.limit) * 10000) / 100 : 0;

        const warningThresholdPercent = (budget.warningThreshold || 0.8) * 100;

        if (percentageBudgetConsumed >= 100) {
          status = BudgetStatus.EXCEEDED;
          alerts.push(`🚨 Presupuesto excedido en ${cat}: gasto $${spent} vs límite $${budget.limit} (${percentageBudgetConsumed}%).`);
        } else if (percentageBudgetConsumed >= warningThresholdPercent) {
          status = BudgetStatus.WARNING;
          alerts.push(`⚠️ Alerta de presupuesto en ${cat}: ${percentageBudgetConsumed}% consumido (límite $${budget.limit}).`);
        } else {
          status = BudgetStatus.OK;
        }
      }

      // Incluir solo categorías con transacciones o con presupuesto asignado
      if (spent > 0 || budget) {
        categories.push({
          category: cat,
          spent,
          budgetLimit,
          remainingBudget,
          percentageBudgetConsumed,
          status,
          transactionCount: expData.count,
        });
      }
    }

    // Ordenar categorías por mayor gasto descendente
    categories.sort((a, b) => b.spent - a.spent);

    // 5. Categorías con mayor gasto (Top Spending)
    const topCategories: TopSpendingCategory[] = categories
      .filter((c) => c.spent > 0)
      .slice(0, 5)
      .map((c) => ({
        category: c.category,
        spent: c.spent,
        percentageOfTotalExpenses:
          totalExpenses > 0 ? Math.round((c.spent / totalExpenses) * 10000) / 100 : 0,
      }));

    // 6. Resumen financiero global
    const netSavings = Math.round((totalIncome - totalExpenses) * 100) / 100;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 10000) / 100 : 0;
    const budgetUtilizationRate =
      totalBudgeted > 0 ? Math.round((totalExpenses / totalBudgeted) * 10000) / 100 : 0;

    const reportId = uuidv4();
    const generatedAt = new Date().toISOString();
    const fileName = `report-${month}-${reportId}.json`;
    const filePath = path.join(this.reportsDir, fileName);

    const report: MonthlyReport = {
      id: reportId,
      month,
      startDate,
      endDate,
      title: `Reporte Mensual de Gastos - ${month}`,
      generatedAt,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netSavings,
        savingsRate,
        totalTransactions: transactions.length,
        totalExpenseTransactions,
        totalIncomeTransactions,
        totalBudgeted: Math.round(totalBudgeted * 100) / 100,
        budgetUtilizationRate,
      },
      categories,
      topCategories,
      alerts,
      file: {
        fileName,
        filePath,
        fileFormat: 'json',
        fileSizeBytes: 0,
        downloadUrl: `/api/reports/${reportId}/download`,
      },
    };

    // 7. Persistir como archivo físico en disco accesible
    await fs.mkdir(this.reportsDir, { recursive: true });
    const jsonContent = JSON.stringify(report, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf-8');

    // Actualizar tamaño de archivo
    const stats = await fs.stat(filePath);
    report.file.fileSizeBytes = stats.size;

    // 8. Guardar en repositorio
    this.repository.save(report);

    return report;
  }

  findAll(filters?: ReportFilters): { data: MonthlyReport[]; count: number } {
    const data = this.repository.findAll(filters);
    return { data, count: data.length };
  }

  findById(id: string): MonthlyReport | undefined {
    return this.repository.findById(id);
  }

  findByMonth(month: string): MonthlyReport | undefined {
    return this.repository.findByMonth(month);
  }

  getReportFilePath(id: string): { filePath: string; fileName: string; contentType: string } | undefined {
    const report = this.repository.findById(id);
    if (!report) return undefined;

    return {
      filePath: report.file.filePath,
      fileName: report.file.fileName,
      contentType: 'application/json',
    };
  }

  async delete(id: string): Promise<boolean> {
    const report = this.repository.findById(id);
    if (!report) return false;

    // Eliminar archivo físico si existe
    try {
      await fs.unlink(report.file.filePath);
    } catch {
      // Ignorar si el archivo ya no existía en disco
    }

    return this.repository.delete(id);
  }
}
