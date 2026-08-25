import { Collection, InsertManyResult } from 'mongodb';
import { LogEvent } from '../types/log.types';

export class LogRepository {
  constructor(private readonly collection: Collection<LogEvent>) {}

  async insertMany(logs: LogEvent[]): Promise<InsertManyResult<LogEvent>> {
    if (logs.length === 0) return {} as InsertManyResult<LogEvent>;

    return this.collection.insertMany(logs, {
      ordered: false,
    });
  }
}
