import { Collection, InsertManyResult } from 'mongodb';
import { LogEvent } from '../types/log.types';

export interface LogStore {
  insertMany(logs: LogEvent[]): Promise<unknown>;
}

export class LogRepository implements LogStore {
  constructor(private readonly collection: Collection<LogEvent>) {}

  async insertMany(logs: LogEvent[]): Promise<InsertManyResult<LogEvent>> {
    if (logs.length === 0) return {} as InsertManyResult<LogEvent>;

    return this.collection.insertMany(logs, {
      ordered: false,
    });
  }
}

export class InMemoryLogRepository implements LogStore {
  private readonly logs: LogEvent[] = [];

  async insertMany(logs: LogEvent[]): Promise<void> {
    this.logs.push(...logs);
  }

  getAll(): LogEvent[] {
    return [...this.logs];
  }
}
