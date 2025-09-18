import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required'),
});

export const candidateSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10),
  name: z.string().min(1, 'Name is required'),
  darsname: z.string().min(1, 'Dars name is required'),
  darsplace: z.string().optional(),
  zone: z.string().min(1, 'Zone is required').max(50),
  slug: z.string().optional(),
  category: z.enum(['JUNIOR', 'SENIOR']),
  stage1: z.string().optional().nullable(),
  stage2: z.string().optional().nullable(),
  stage3: z.string().optional().nullable(),
  groupstage1: z.string().optional().nullable(),
  groupstage2: z.string().optional().nullable(),
  groupstage3: z.string().optional().nullable(),
  offstage1: z.string().optional().nullable(),
  offstage2: z.string().optional().nullable(),
  offstage3: z.string().optional().nullable(),
  groupoffstage: z.string().optional().nullable(),
});

export const candidateUpdateSchema = candidateSchema.partial().omit({ code: true });

export const programSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['JUNIOR', 'SENIOR']),
  type: z.enum(['stage', 'offstage', 'group']),
  description: z.string().optional(),
});

export const programUpdateSchema = programSchema.partial();

export const darsSchema = z.object({
  darsname: z.string().min(1, 'Dars name is required'),
  darsplace: z.string().optional(),
  zone: z.string().min(1, 'Zone is required').max(50),
  slug: z.string().optional(),
  totalCandidates: z.number().int().min(0).optional(),
});

export const darsUpdateSchema = darsSchema.partial().omit({ darsname: true });

export type LoginData = z.infer<typeof loginSchema>;
export type CandidateData = z.infer<typeof candidateSchema>;
export type CandidateUpdateData = z.infer<typeof candidateUpdateSchema>;
export type ProgramData = z.infer<typeof programSchema>;
export type ProgramUpdateData = z.infer<typeof programUpdateSchema>;
export type DarsData = z.infer<typeof darsSchema>;
export type DarsUpdateData = z.infer<typeof darsUpdateSchema>;