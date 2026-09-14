import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  transactionsServiceUrl: process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3001',
  budgetsServiceUrl: process.env.BUDGETS_SERVICE_URL || 'http://localhost:3003',
  reportsDir: process.env.REPORTS_DIR || path.resolve(process.cwd(), 'storage/reports'),
} as const;
