import type { ExternalBudget } from '../../models/report.model.js';

export interface IBudgetsClient {
  getBudgets(): Promise<ExternalBudget[]>;
}

export class HttpBudgetsClient implements IBudgetsClient {
  constructor(private readonly baseUrl: string) {}

  async getBudgets(): Promise<ExternalBudget[]> {
    const url = new URL('/api/budgets', this.baseUrl);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`budgets-service respondió con código HTTP ${response.status}`);
      }

      const json = await response.json() as { success: boolean; data?: ExternalBudget[]; error?: string };
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error(json.error || 'Respuesta inesperada desde budgets-service');
      }

      return json.data;
    } catch (error) {
      console.warn(`[reports-service] No se pudo conectar a budgets-service en ${url}:`, (error as Error).message);
      // Retornar array vacío para resiliencia si el servicio no está disponible en modo desarrollo
      return [];
    }
  }
}
