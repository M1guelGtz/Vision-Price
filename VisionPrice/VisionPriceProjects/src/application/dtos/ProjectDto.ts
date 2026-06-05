import { Project, ProjectStatus, WorkType } from '../../domain/entities/Project';

export interface PublicProjectDto {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description: string | null;
  readonly clientName: string | null;
  readonly location: string | null;
  readonly workType: WorkType;
  /** Decimal string like "14.20" or null. */
  readonly area: string | null;
  /** Decimal string like "1234.50" or null. */
  readonly totalBudget: string | null;
  readonly status: ProjectStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function toPublic(project: Project): PublicProjectDto {
  return {
    id: project.id,
    ownerId: project.ownerId,
    name: project.name,
    description: project.description,
    clientName: project.clientName,
    location: project.location,
    workType: project.workType,
    area: project.area,
    totalBudget: project.totalBudget === null ? null : project.totalBudget.toDecimalString(),
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
