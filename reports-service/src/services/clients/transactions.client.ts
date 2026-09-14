import type { ExternalTransaction } from '../../models/report.model.js';

export interface ITransactionsClient {
  getTransactions(startDate: string, endDate: string): Promise<ExternalTransaction[]>;
}

export class HttpTransactionsClient implements ITransactionsClient {
  constructor(private readonly baseUrl: string) {}

  async getTransactions(startDate: string, endDate: string): Promise<ExternalTransaction[]> {
    const url = new URL('/api/transactions', this.baseUrl);
    url.searchParams.set('startDate', startDate);
    url.searchParams.set('endDate', endDate);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`transactions-service respondió con código HTTP ${response.status}`);
      }

      const json = await response.json() as { success: boolean; data?: ExternalTransaction[]; error?: string };
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error(json.error || 'Respuesta inesperada desde transactions-service');
      }

      return json.data;
    } catch (error) {
      console.warn(`[reports-service] No se pudo conectar a transactions-service en ${url}:`, (error as Error).message);
      // Retornar array vacío para resiliencia si el servicio no está disponible en modo desarrollo
      return [];
    }
  }
}
