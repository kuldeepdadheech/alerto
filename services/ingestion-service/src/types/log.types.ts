import { z } from 'zod';
import { LogEventSchema } from '../schemas/log.schema';

export type LogEvent = z.infer<typeof LogEventSchema>;
