import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { InMemoryReportRepository } from './repositories/reports.repository.js';
import { HttpTransactionsClient } from './services/clients/transactions.client.js';
import { HttpBudgetsClient } from './services/clients/budgets.client.js';
import { ReportService } from './services/reports.service.js';
import { ReportController } from './controllers/reports.controller.js';
import { createReportRouter } from './routes/reports.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

// --- Composición de dependencias (Poor Man's DI) ---
const repository = new InMemoryReportRepository();
const transactionsClient = new HttpTransactionsClient(config.transactionsServiceUrl);
const budgetsClient = new HttpBudgetsClient(config.budgetsServiceUrl);
const service = new ReportService(repository, transactionsClient, budgetsClient, config.reportsDir);
const controller = new ReportController(service);

// --- App Express ---
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'reports-service' });
});

// Rutas de reportes
app.use('/api/reports', createReportRouter(controller));

// Error handler global (debe ir después de las rutas)
app.use(errorHandler);

// --- Arranque ---
app.listen(config.port, () => {
  console.log(`📊 reports-service corriendo en http://localhost:${config.port}`);
});
