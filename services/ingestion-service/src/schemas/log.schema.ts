import { z } from 'zod';

export const LogLevelEnum = z.enum([
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
]);

export const EnvironmentEnum = z.enum([
  'dev',
  'staging',
  'prod',
]);

export const EntitySchema = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
});

export const LogEventSchema = z.object({
  timestamp: z.string().datetime(),
  service: z.string().min(1),
  environment: EnvironmentEnum,
  level: LogLevelEnum,
  message: z.string().min(1),

  errorCode: z.string().optional(),
  entity: EntitySchema.optional(),

  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const LogBatchSchema = z.object({
  logs: z.array(LogEventSchema).min(1),
});
