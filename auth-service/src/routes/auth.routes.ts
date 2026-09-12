import { Router } from 'express';
import type { AuthController } from '../controllers/auth.controller.js';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();
  router.post('/login', controller.login);
  router.get('/me', controller.me);
  return router;
}
