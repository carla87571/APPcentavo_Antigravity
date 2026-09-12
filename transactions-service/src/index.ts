import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { InMemoryTransactionRepository } from './repositories/transactions.repository.js';
import { TransactionService } from './services/transactions.service.js';
import { TransactionController } from './controllers/transactions.controller.js';
import { createTransactionRouter } from './routes/transactions.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

// --- Composición de dependencias (Poor Man's DI) ---
const repository = new InMemoryTransactionRepository();
const service = new TransactionService(repository);
const controller = new TransactionController(service);

// --- App Express ---
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'transactions-service' });
});

// Rutas de transacciones
app.use('/api/transactions', createTransactionRouter(controller));

// Error handler global (debe ir después de las rutas)
app.use(errorHandler);

// --- Arranque ---
app.listen(config.port, () => {
  console.log(`🪙 transactions-service corriendo en http://localhost:${config.port}`);
});
