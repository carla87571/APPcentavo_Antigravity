import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { AuthService } from './services/auth.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const authService = new AuthService();
const authController = new AuthController(authService);

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Rutas montadas en /auth y /api/auth para máxima compatibilidad
const router = createAuthRouter(authController);
app.use('/auth', router);
app.use('/api/auth', router);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🔐 auth-service corriendo en http://localhost:${config.port}`);
});
