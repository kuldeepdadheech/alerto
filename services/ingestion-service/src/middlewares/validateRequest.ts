import { ZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateRequest =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid request payload',
        errors: result.error.flatten(),
      });
    }

    req.body = result.data;
    next();
  };
