import { NotFoundError } from '../../domain/errors/DomainError';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { PublicProjectDto, toPublic } from '../dtos/ProjectDto';

export interface GetProjectInput {
  readonly id: string;
  readonly actorId: string;
}

export class GetProject {
  public constructor(private readonly repository: IProjectRepository) {}

  public async execute(input: GetProjectInput): Promise<PublicProjectDto> {
    const project = await this.repository.findById(input.id);
    if (project === null) throw new NotFoundError('Project not found');
    if (!project.isOwnedBy(input.actorId)) {
      // Hide existence from non-owners — 404 not 403, prevents id enumeration.
      throw new NotFoundError('Project not found');
    }
    return toPublic(project);
  }
}
