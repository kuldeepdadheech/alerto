import { MongoClient } from 'mongodb';
import { LogRepository } from '../repositories/log.repository';
import { LogEvent } from '../types/log.types';

export interface MongoLogStore {
  client: MongoClient;
  repository: LogRepository;
}

export async function createMongoLogStore(): Promise<MongoLogStore | undefined> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return undefined;

  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db();
  const collection = database.collection<LogEvent>('logs');

  return {
    client,
    repository: new LogRepository(collection),
  };
}
