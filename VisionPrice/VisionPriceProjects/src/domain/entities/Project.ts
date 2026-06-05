import { ValidationError } from '../errors/DomainError';
import { Money } from '../value-objects/Money';

export type ProjectStatus = 'MEASURED' | 'QUOTED' | 'IN_PROGRESS' | 'COMPLETED';
export const ALL_PROJECT_STATUSES: ReadonlyArray<ProjectStatus> = [
  'MEASURED',
  'QUOTED',
  'IN_PROGRESS',
  'COMPLETED',
];

export type WorkType = 'FLOOR' | 'WALL' | 'CEILING' | 'COMBINED';
export const ALL_WORK_TYPES: ReadonlyArray<WorkType> = [
  'FLOOR',
  'WALL',
  'CEILING',
  'COMBINED',
];

export interface ProjectProps {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description: string | null;
  readonly clientName: string | null;
  readonly location: string | null;
  readonly workType: WorkType;
  /** Square meters of the surface, decimal string when persisted. */
  readonly area: string | null;
  readonly totalBudget: Money | null;
  readonly status: ProjectStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Pure domain entity. Knows nothing about Prisma or HTTP.
 * Mutations return new instances via `withChanges()`.
 */
export class Project {
  public readonly id: string;
  public readonly ownerId: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly clientName: string | null;
  public readonly location: string | null;
  public readonly workType: WorkType;
  public readonly area: string | null;
  public readonly totalBudget: Money | null;
  public readonly status: ProjectStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: ProjectProps) {
    const name = props.name.trim();
    if (name.length === 0) throw new ValidationError('Project name cannot be empty');
    if (name.length > 200) throw new ValidationError('Project name is too long (max 200)');
    if (props.ownerId.trim().length === 0) {
      throw new ValidationError('Project must have an ownerId');
    }
    if (!ALL_WORK_TYPES.includes(props.workType)) {
      throw new ValidationError(`Unknown work type: ${props.workType}`);
    }
    if (!ALL_PROJECT_STATUSES.includes(props.status)) {
      throw new ValidationError(`Unknown project status: ${props.status}`);
    }
    if (props.area !== null && !Project.isValidDecimal(props.area)) {
      throw new ValidationError('Area must be a positive decimal with up to 2 digits');
    }

    this.id = props.id;
    this.ownerId = props.ownerId;
    this.name = name;
    this.description = props.description?.trim() || null;
    this.clientName = props.clientName?.trim() || null;
    this.location = props.location?.trim() || null;
    this.workType = props.workType;
    this.area = props.area;
    this.totalBudget = props.totalBudget;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: ProjectProps): Project {
    return new Project(props);
  }

  public isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  public withChanges(changes: Partial<{
    name: string;
    description: string | null;
    clientName: string | null;
    location: string | null;
    workType: WorkType;
    area: string | null;
    totalBudget: Money | null;
    status: ProjectStatus;
  }>): Project {
    return new Project({
      ...this.snapshot(),
      name: changes.name ?? this.name,
      description: changes.description === undefined ? this.description : changes.description,
      clientName: changes.clientName === undefined ? this.clientName : changes.clientName,
      location: changes.location === undefined ? this.location : changes.location,
      workType: changes.workType ?? this.workType,
      area: changes.area === undefined ? this.area : changes.area,
      totalBudget: changes.totalBudget === undefined ? this.totalBudget : changes.totalBudget,
      status: changes.status ?? this.status,
      updatedAt: new Date(),
    });
  }

  private snapshot(): ProjectProps {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      description: this.description,
      clientName: this.clientName,
      location: this.location,
      workType: this.workType,
      area: this.area,
      totalBudget: this.totalBudget,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static isValidDecimal(raw: string): boolean {
    return /^\d+(\.\d{1,2})?$/.test(raw);
  }
}
