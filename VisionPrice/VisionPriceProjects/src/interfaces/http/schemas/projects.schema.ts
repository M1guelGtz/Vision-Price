import { z } from 'zod';

const decimalString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a positive decimal with up to 2 digits');

const projectStatus = z.enum(['MEASURED', 'QUOTED', 'IN_PROGRESS', 'COMPLETED']);
const workType = z.enum(['FLOOR', 'WALL', 'CEILING', 'COMBINED']);

export const CreateProjectBodySchema = z.object({
  name: z.string().min(1).max(200),
  workType: workType,
  description: z.string().max(2000).optional().nullable(),
  clientName: z.string().max(160).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  area: decimalString.optional().nullable(),
  totalBudget: decimalString.optional().nullable(),
  status: projectStatus.optional(),
});

export const UpdateProjectBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    workType: workType.optional(),
    description: z.string().max(2000).optional().nullable(),
    clientName: z.string().max(160).optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    area: decimalString.optional().nullable(),
    totalBudget: decimalString.optional().nullable(),
    status: projectStatus.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No changes provided' });

export const ListProjectsQuerySchema = z.object({
  status: projectStatus.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const ProjectIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateProjectBody = z.infer<typeof CreateProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof UpdateProjectBodySchema>;
export type ListProjectsQueryParams = z.infer<typeof ListProjectsQuerySchema>;
export type ProjectIdParams = z.infer<typeof ProjectIdParamsSchema>;
