import {
  PrismaClient,
  Project as PrismaProject,
  ProjectStatus as PrismaStatus,
  WorkType as PrismaWorkType,
} from '@prisma/client';
import { Prisma } from '@prisma/client';

import { Project, ProjectStatus, WorkType } from '../../../domain/entities/Project';
import { IProjectRepository, ListProjectsQuery } from '../../../domain/repositories/IProjectRepository';
import { Money } from '../../../domain/value-objects/Money';

export class PrismaProjectRepository implements IProjectRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    return row === null ? null : PrismaProjectRepository.toDomain(row);
  }

  public async list(query: ListProjectsQuery): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      where: {
        ownerId: query.ownerId,
        ...(query.status !== undefined && {
          status: PrismaProjectRepository.statusToPrisma(query.status),
        }),
      },
      orderBy: { updatedAt: 'desc' },
      take: query.limit ?? 50,
      skip: query.offset ?? 0,
    });
    return rows.map(PrismaProjectRepository.toDomain);
  }

  public async save(project: Project): Promise<Project> {
    const row = await this.prisma.project.create({
      data: PrismaProjectRepository.toPersistence(project),
    });
    return PrismaProjectRepository.toDomain(row);
  }

  public async update(project: Project): Promise<Project> {
    const row = await this.prisma.project.update({
      where: { id: project.id },
      data: PrismaProjectRepository.toPersistence(project),
    });
    return PrismaProjectRepository.toDomain(row);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  // ---------- mappers ----------

  private static toDomain(row: PrismaProject): Project {
    return Project.create({
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      description: row.description,
      clientName: row.clientName,
      location: row.location,
      workType: row.workType as WorkType,
      area: row.area === null ? null : row.area.toString(),
      totalBudget:
        row.totalBudget === null
          ? null
          : Money.fromDecimalString(row.totalBudget.toString()),
      status: row.status as ProjectStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private static toPersistence(project: Project): {
    id: string;
    ownerId: string;
    name: string;
    description: string | null;
    clientName: string | null;
    location: string | null;
    workType: PrismaWorkType;
    area: Prisma.Decimal | null;
    totalBudget: Prisma.Decimal | null;
    status: PrismaStatus;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: project.id,
      ownerId: project.ownerId,
      name: project.name,
      description: project.description,
      clientName: project.clientName,
      location: project.location,
      workType: project.workType as PrismaWorkType,
      area: project.area === null ? null : new Prisma.Decimal(project.area),
      totalBudget:
        project.totalBudget === null
          ? null
          : new Prisma.Decimal(project.totalBudget.toDecimalString()),
      status: PrismaProjectRepository.statusToPrisma(project.status),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private static statusToPrisma(status: ProjectStatus): PrismaStatus {
    return status as PrismaStatus;
  }
}
