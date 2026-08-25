import { Router } from 'express';
import logsRouter from './logs.routes';

const router = Router();

router.use('/v1/logs', logsRouter);

export default router;
