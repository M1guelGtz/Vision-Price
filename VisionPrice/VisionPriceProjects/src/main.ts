/**
 * Composition root for projects-service. Mirrors the layout of auth-service:
 * only this file knows about every layer, and DI is manual.
 */

import { loadEnv } from './infrastructure/config/env';
import { createPrismaClient } from './infrastructure/database/PrismaClientFactory';
import { PrismaProjectRepository } from './infrastructure/database/repositories/PrismaProjectRepository';
import { JwtVerifier } from './infrastructure/auth/JwtVerifier';

import { CreateProject } from './application/use-cases/CreateProject';
import { DeleteProject } from './application/use-cases/DeleteProject';
import { GetProject } from './application/use-cases/GetProject';
import { ListProjects } from './application/use-cases/ListProjects';
import { UpdateProject } from './application/use-cases/UpdateProject';

import { ProjectsController } from './interfaces/http/controllers/ProjectsController';
import { buildApp } from './interfaces/app';

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const isProduction = env.NODE_ENV === 'production';

  const prisma = createPrismaClient();
  const projectRepository = new PrismaProjectRepository(prisma);
  const jwtVerifier = new JwtVerifier(env.JWT_ACCESS_SECRET);

  const createProject = new CreateProject(projectRepository);
  const listProjects = new ListProjects(projectRepository);
  const getProject = new GetProject(projectRepository);
  const updateProject = new UpdateProject(projectRepository);
  const deleteProject = new DeleteProject(projectRepository);

  const projectsController = new ProjectsController(
    createProject,
    listProjects,
    getProject,
    updateProject,
    deleteProject,
  );

  const app = await buildApp({ projectsController, jwtVerifier, isProduction });

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    app.log.info({ signal }, 'Shutting down');
    try {
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    // El healthcheck de Railway sondea por IPv4, por lo que el bind debe ser
    // '0.0.0.0' (todas las interfaces IPv4) y no '::'.
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`projects-service listening on :${env.PORT}`);
  } catch (err) {
    app.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
