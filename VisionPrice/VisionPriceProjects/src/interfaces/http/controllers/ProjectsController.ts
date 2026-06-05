import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthError } from '../../../domain/errors/DomainError';
import { CreateProject } from '../../../application/use-cases/CreateProject';
import { DeleteProject } from '../../../application/use-cases/DeleteProject';
import { GetProject } from '../../../application/use-cases/GetProject';
import { ListProjects } from '../../../application/use-cases/ListProjects';
import { UpdateProject } from '../../../application/use-cases/UpdateProject';
import {
  CreateProjectBodySchema,
  ListProjectsQuerySchema,
  ProjectIdParamsSchema,
  UpdateProjectBodySchema,
} from '../schemas/projects.schema';

export class ProjectsController {
  public constructor(
    private readonly createProject: CreateProject,
    private readonly listProjects: ListProjects,
    private readonly getProject: GetProject,
    private readonly updateProject: UpdateProject,
    private readonly deleteProject: DeleteProject,
  ) {}

  public list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = this.requireUserId(request);
    const query = ListProjectsQuerySchema.parse(request.query);
    const projects = await this.listProjects.execute({ ownerId: userId, ...query });
    reply.send({ projects });
  };

  public create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = this.requireUserId(request);
    const body = CreateProjectBodySchema.parse(request.body);
    const project = await this.createProject.execute({ ownerId: userId, ...body });
    reply.code(201).send({ project });
  };

  public detail = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = this.requireUserId(request);
    const { id } = ProjectIdParamsSchema.parse(request.params);
    const project = await this.getProject.execute({ id, actorId: userId });
    reply.send({ project });
  };

  public update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = this.requireUserId(request);
    const { id } = ProjectIdParamsSchema.parse(request.params);
    const changes = UpdateProjectBodySchema.parse(request.body);
    const project = await this.updateProject.execute({ id, actorId: userId, changes });
    reply.send({ project });
  };

  public remove = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = this.requireUserId(request);
    const { id } = ProjectIdParamsSchema.parse(request.params);
    await this.deleteProject.execute({ id, actorId: userId });
    reply.code(204).send();
  };

  private requireUserId(request: FastifyRequest): string {
    if (request.auth === undefined) throw new AuthError('Not authenticated');
    return request.auth.userId;
  }
}
