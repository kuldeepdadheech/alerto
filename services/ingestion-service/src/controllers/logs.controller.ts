import { Request, Response } from 'express';
import {logIngestionService} from '../services/logIngestion.service';

export const ingestLogs = async (req: Request, res: Response) => {
  const { logs } = req.body;

  await logIngestionService.ingestLogs(logs);

  res.status(202).json({
    status: 'accepted',
    ingestedCount: logs.length,
  });
};
