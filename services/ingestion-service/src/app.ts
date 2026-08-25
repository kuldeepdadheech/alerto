import express, { Request, Response } from 'express';
import routes from './routes';

const app = express();

app.use(express.json());

app.use(routes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).send({ status: 'OK' });
});

export default app;
