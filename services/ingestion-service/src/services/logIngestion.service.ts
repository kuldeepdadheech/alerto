import { LogRepository } from "../repositories/log.repository";
import { LogEvent } from '../types/log.types';
import { kafkaProducerService } from "./kafkaProducer.service";

class LogIngestionService{
    constructor(private readonly repo: LogRepository){}
    async ingestLogs(logs:LogEvent[]):Promise<void>{
        if (logs.length === 0) return;
        await this.repo.insertMany(logs)
        kafkaProducerService.publishLogs(logs).catch((err)=>{
        console.log('Kafka publish failed', err)
        })
    }
}

export default LogIngestionService;