import { ProjectStatus } from '../../domain/entities/Project';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { PublicProjectDto, toPublic } from '../dtos/ProjectDto';

export interface ListProjectsInput {
  readonly ownerId: string;
  readonly status?: ProjectStatus;
  readonly limit?: number;
  readonly offset?: number;
}

export class ListProjects {
  public constructor(private readonly repository: IProjectRepository) {}

  public async execute(input: ListProjectsInput): Promise<PublicProjectDto[]> {
    const projects = await this.repository.list(input);
    return projects.map(toPublic);
  }
}
