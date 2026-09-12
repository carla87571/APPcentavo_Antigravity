import type {
  Transaction,
  CreateTransactionDTO,
  TransactionFilters,
} from '../models/transaction.model.js';
import type { ITransactionRepository } from '../repositories/transactions.repository.js';

/**
 * Capa de lógica de negocio para transacciones.
 *
 * Orquesta operaciones entre la validación (ya hecha en el controller)
 * y el repositorio. Aquí se colocaría lógica como emisión de eventos,
 * cálculos derivados, o reglas de negocio complejas.
 */
export class TransactionService {
  constructor(private readonly repository: ITransactionRepository) {}

  create(dto: CreateTransactionDTO): Transaction {
    return this.repository.create(dto);
  }

  findAll(filters?: TransactionFilters): { data: Transaction[]; count: number } {
    const data = this.repository.findAll(filters);
    return { data, count: data.length };
  }

  findById(id: string): Transaction | undefined {
    return this.repository.findById(id);
  }
}
