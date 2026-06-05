import { Project, ProjectStatus } from '../entities/Project';

export interface ListProjectsQuery {
  readonly ownerId: string;
  readonly status?: ProjectStatus;
  readonly limit?: number;
  readonly offset?: number;
}

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  list(query: ListProjectsQuery): Promise<Project[]>;
  save(project: Project): Promise<Project>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
}
