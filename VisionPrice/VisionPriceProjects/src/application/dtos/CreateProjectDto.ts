import { ProjectStatus, WorkType } from '../../domain/entities/Project';

export interface CreateProjectInput {
  readonly ownerId: string;
  readonly name: string;
  readonly workType: WorkType;
  readonly description?: string | null;
  readonly clientName?: string | null;
  readonly location?: string | null;
  /** Decimal string. */
  readonly area?: string | null;
  /** Decimal string. */
  readonly totalBudget?: string | null;
  readonly status?: ProjectStatus;
}
