import { randomUUID } from 'node:crypto';

import { Project } from '../../domain/entities/Project';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { Money } from '../../domain/value-objects/Money';
import { CreateProjectInput } from '../dtos/CreateProjectDto';
import { PublicProjectDto, toPublic } from '../dtos/ProjectDto';

export class CreateProject {
  public constructor(private readonly repository: IProjectRepository) {}

  public async execute(input: CreateProjectInput): Promise<PublicProjectDto> {
    const now = new Date();
    const project = Project.create({
      id: randomUUID(),
      ownerId: input.ownerId,
      name: input.name,
      description: input.description ?? null,
      clientName: input.clientName ?? null,
      location: input.location ?? null,
      workType: input.workType,
      area: input.area ?? null,
      totalBudget: input.totalBudget == null
        ? null
        : Money.fromDecimalString(input.totalBudget),
      // Defaults to MEASURED — a freshly created project hasn't been
      // quoted yet. The scanner step will move it to QUOTED later.
      status: input.status ?? 'MEASURED',
      createdAt: now,
      updatedAt: now,
    });
    const saved = await this.repository.save(project);
    return toPublic(saved);
  }
}
