import { NotFoundError } from '../../domain/errors/DomainError';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';

export interface DeleteProjectInput {
  readonly id: string;
  readonly actorId: string;
}

export class DeleteProject {
  public constructor(private readonly repository: IProjectRepository) {}

  public async execute(input: DeleteProjectInput): Promise<void> {
    const project = await this.repository.findById(input.id);
    if (project === null || !project.isOwnedBy(input.actorId)) {
      throw new NotFoundError('Project not found');
    }
    await this.repository.delete(input.id);
  }
}
