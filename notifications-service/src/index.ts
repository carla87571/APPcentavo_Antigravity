import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { InMemoryNotificationRepository } from './repositories/notifications.repository.js';
import { NotificationService } from './services/notifications.service.js';
import { NotificationController } from './controllers/notifications.controller.js';
import { createNotificationRouter } from './routes/notifications.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

// --- Composición de dependencias (Poor Man's DI) ---
const repository = new InMemoryNotificationRepository();
const service = new NotificationService(repository);
const controller = new NotificationController(service);

// --- App Express ---
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notifications-service' });
});

// Rutas de notificaciones y alertas
app.use('/api/notifications', createNotificationRouter(controller));

// Error handler global (debe ir después de las rutas)
app.use(errorHandler);

// --- Arranque ---
app.listen(config.port, () => {
  console.log(`🔔 notifications-service corriendo en http://localhost:${config.port}`);
});
