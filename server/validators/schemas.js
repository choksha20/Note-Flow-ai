import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
  name: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional()
});

export const createNoteSchema = z.object({
  raw_text: z.string().min(20, 'Raw text must be at least 20 characters').max(10000, 'Raw text cannot exceed 10,000 characters'),
  title: z.string().optional()
});

export const updateNoteSchema = z.object({
  raw_text: z.string().min(20, 'Raw text must be at least 20 characters').max(10000, 'Raw text cannot exceed 10,000 characters'),
  title: z.string().optional()
});

export const updateActionItemSchema = z.object({
  task: z.string().min(1).optional(),
  owner: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['open', 'done']).optional()
});

export const actionItemSchema = z.object({
  task: z.string().min(1, 'Task description cannot be empty'),
  owner: z.string().nullable().catch(null),
  deadline: z.string().nullable().catch(null), // ISO date or null
  priority: z.enum(['low', 'medium', 'high']).catch('medium')
});

export const geminiResponseSchema = z.object({
  summary: z.string().min(1, 'Summary cannot be empty'),
  decisions: z.array(z.string()).default([]),
  action_items: z.array(actionItemSchema).default([])
});
