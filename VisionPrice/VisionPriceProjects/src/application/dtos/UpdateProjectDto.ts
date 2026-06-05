import { ProjectStatus, WorkType } from '../../domain/entities/Project';

export interface UpdateProjectInput {
  readonly id: string;
  readonly actorId: string;
  readonly changes: {
    readonly name?: string;
    readonly description?: string | null;
    readonly clientName?: string | null;
    readonly location?: string | null;
    readonly workType?: WorkType;
    /** Decimal string or null to clear. */
    readonly area?: string | null;
    /** Decimal string or null to clear. */
    readonly totalBudget?: string | null;
    readonly status?: ProjectStatus;
  };
}
