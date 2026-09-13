import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { InMemoryBudgetRepository } from './repositories/budgets.repository.js';
import { BudgetService } from './services/budgets.service.js';
import { BudgetController } from './controllers/budgets.controller.js';
import { createBudgetRouter } from './routes/budgets.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

// --- Composición de dependencias (Poor Man's DI) ---
const repository = new InMemoryBudgetRepository();
const service = new BudgetService(repository);
const controller = new BudgetController(service);

// --- App Express ---
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'budgets-service' });
});

// Rutas de presupuestos
app.use('/api/budgets', createBudgetRouter(controller));

// Error handler global (debe ir después de las rutas)
app.use(errorHandler);

// --- Arranque ---
app.listen(config.port, () => {
  console.log(`🎯 budgets-service corriendo en http://localhost:${config.port}`);
});
