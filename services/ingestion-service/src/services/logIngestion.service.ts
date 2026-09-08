import { InMemoryLogRepository, LogStore } from '../repositories/log.repository';
import { LogEvent } from '../types/log.types';
import { kafkaProducerService } from './kafkaProducer.service';

export class LogIngestionService {
    constructor(private repo: LogStore) {}

    setRepository(repo: LogStore): void {
        this.repo = repo;
    }

    async ingestLogs(logs: LogEvent[]): Promise<void> {
        if (logs.length === 0) return;

        await this.repo.insertMany(logs);
        void kafkaProducerService.publishLogs(logs).catch((err) => {
            console.error('Kafka publish failed', err);
        });
    }
}

export const logIngestionService = new LogIngestionService(
    new InMemoryLogRepository(),
);