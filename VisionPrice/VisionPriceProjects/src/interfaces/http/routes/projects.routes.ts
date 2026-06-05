import { FastifyInstance, FastifyPluginAsync, preHandlerHookHandler } from 'fastify';

import { ProjectsController } from '../controllers/ProjectsController';

export interface ProjectsRoutesDeps {
  readonly controller: ProjectsController;
  readonly authGuard: preHandlerHookHandler;
}

export const buildProjectsRoutes = (deps: ProjectsRoutesDeps): FastifyPluginAsync => {
  return async (fastify: FastifyInstance): Promise<void> => {
    fastify.addHook('preHandler', deps.authGuard); // every /projects/* requires Bearer

    fastify.get('/projects', deps.controller.list);
    fastify.post('/projects', deps.controller.create);
    fastify.get('/projects/:id', deps.controller.detail);
    fastify.patch('/projects/:id', deps.controller.update);
    fastify.delete('/projects/:id', deps.controller.remove);
  };
};
