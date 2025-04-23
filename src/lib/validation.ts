import { z } from 'zod';
import type { Database } from '../db/database.types';

type OperatingSystem = Database['public']['Enums']['operating_system_enum'];
const VALID_OPERATING_SYSTEMS = ['Windows', 'macOS', 'Linux', 'Other'] as const;

// Zod schemas for validation
export const operatingSystemSchema = z.enum(VALID_OPERATING_SYSTEMS);

export const createShortcutGroupSchema = z.object({
  name: z.string()
    .min(1, { message: 'Name is required' })
    .max(255, { message: 'Name must be less than 255 characters' })
    .trim(),
  application_id: z.string().uuid({ message: 'Must be a valid UUID' }),
  operating_system: operatingSystemSchema,
});

export const createApplicationSchema = z.object({
  name: z.string()
    .min(1, { message: 'Name is required' })
    .max(255, { message: 'Name must be less than 255 characters' })
    .trim()
});

// Convert Zod errors into our standard API error format
export function formatZodError(error: z.ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
}
