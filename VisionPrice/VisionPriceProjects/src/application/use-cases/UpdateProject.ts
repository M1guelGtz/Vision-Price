import { NotFoundError, ValidationError } from '../../domain/errors/DomainError';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { Money } from '../../domain/value-objects/Money';
import { UpdateProjectInput } from '../dtos/UpdateProjectDto';
import { PublicProjectDto, toPublic } from '../dtos/ProjectDto';

export class UpdateProject {
  public constructor(private readonly repository: IProjectRepository) {}

  public async execute(input: UpdateProjectInput): Promise<PublicProjectDto> {
    const project = await this.repository.findById(input.id);
    if (project === null || !project.isOwnedBy(input.actorId)) {
      throw new NotFoundError('Project not found');
    }

    const c = input.changes;
    const totalBudget =
      c.totalBudget === undefined
        ? undefined
        : c.totalBudget === null
          ? null
          : Money.fromDecimalString(c.totalBudget);

    const changes: Parameters<typeof project.withChanges>[0] = {};
    if (c.name !== undefined) changes.name = c.name;
    if (c.description !== undefined) changes.description = c.description;
    if (c.clientName !== undefined) changes.clientName = c.clientName;
    if (c.location !== undefined) changes.location = c.location;
    if (c.workType !== undefined) changes.workType = c.workType;
    if (c.area !== undefined) changes.area = c.area;
    if (totalBudget !== undefined) changes.totalBudget = totalBudget;
    if (c.status !== undefined) changes.status = c.status;

    if (Object.keys(changes).length === 0) {
      throw new ValidationError('No changes provided');
    }

    const updated = project.withChanges(changes);
    const saved = await this.repository.update(updated);
    return toPublic(saved);
  }
}
