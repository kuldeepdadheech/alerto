import { Router } from 'express';
import { LogBatchSchema } from '../schemas/log.schema';
import { validateRequest } from '../middlewares/validateRequest';
import { ingestLogs } from '../controllers/logs.controller';

const router = Router();

router.post('/', validateRequest(LogBatchSchema), ingestLogs);

export default router;
