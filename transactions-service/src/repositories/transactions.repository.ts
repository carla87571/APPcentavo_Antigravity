import type {
  Transaction,
  CreateTransactionDTO,
  TransactionFilters,
} from '../models/transaction.model.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Contrato del repositorio de transacciones.
 *
 * Cualquier implementación (in-memory, PostgreSQL, MongoDB) debe
 * satisfacer esta interfaz, lo que permite sustituir el almacenamiento
 * sin modificar la capa de servicio.
 */
export interface ITransactionRepository {
  create(dto: CreateTransactionDTO): Transaction;
  findAll(filters?: TransactionFilters): Transaction[];
  findById(id: string): Transaction | undefined;
}

/**
 * Implementación in-memory del repositorio de transacciones.
 * Ideal para desarrollo y pruebas; reemplazar por una DB real en producción.
 */
export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Transaction[] = [];

  create(dto: CreateTransactionDTO): Transaction {
    const transaction: Transaction = {
      id: uuidv4(),
      ...dto,
      createdAt: new Date().toISOString(),
    };
    this.transactions.push(transaction);
    return transaction;
  }

  findAll(filters?: TransactionFilters): Transaction[] {
    let results = [...this.transactions];

    if (filters?.category) {
      results = results.filter((t) => t.category === filters.category);
    }

    if (filters?.type) {
      results = results.filter((t) => t.type === filters.type);
    }

    if (filters?.startDate) {
      results = results.filter((t) => t.date >= filters.startDate!);
    }

    if (filters?.endDate) {
      results = results.filter((t) => t.date <= filters.endDate!);
    }

    // Orden cronológico descendente (más recientes primero)
    return results.sort((a, b) => b.date.localeCompare(a.date));
  }

  findById(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }
}
