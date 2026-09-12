export type TransactionType = "INCOME" | "EXPENSE" | "income" | "expense";

export type TransactionCategory =
  | "alimentacion"
  | "food"
  | "transporte"
  | "transport"
  | "ocio"
  | "entertainment"
  | "servicios"
  | "services"
  | "salud"
  | "educacion"
  | "vivienda"
  | "housing"
  | "salary"
  | "otros"
  | "other";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory | string;
  description: string;
  date: string;
  createdAt?: string;
}
