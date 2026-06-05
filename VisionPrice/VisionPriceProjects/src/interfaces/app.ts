import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import Fastify, { FastifyInstance } from 'fastify';

import { ProjectsController } from './http/controllers/ProjectsController';
import { JwtVerifier } from '../infrastructure/auth/JwtVerifier';
import { buildAuthGuard } from './http/middlewares/authGuard';
import { buildErrorHandler } from './http/middlewares/errorHandler';
import { buildProjectsRoutes } from './http/routes/projects.routes';

export interface AppOptions {
  readonly projectsController: ProjectsController;
  readonly jwtVerifier: JwtVerifier;
  readonly isProduction: boolean;
}

export async function buildApp(opts: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: opts.isProduction ? 'info' : 'debug' },
    trustProxy: true,
  });

  await app.register(fastifyHelmet, { contentSecurityPolicy: false });
  await app.register(fastifyCors, { origin: true, credentials: true });
  await app.register(fastifyRateLimit, { global: false });

  app.setErrorHandler(buildErrorHandler({ isProduction: opts.isProduction }));

  app.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));

  const authGuard = buildAuthGuard(opts.jwtVerifier);
  await app.register(
    buildProjectsRoutes({ controller: opts.projectsController, authGuard }),
  );

  return app;
}
