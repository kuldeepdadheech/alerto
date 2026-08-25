import { Kafka, Producer } from 'kafkajs';
// import { kafkaConfig } from '../config/kafka.config';
import { LogEvent } from '../types/log.types';
import { kafkaConfig } from '../config/kafka.config';
import { KAFKA_TOPICS } from '../config/kafka.topics';

class KafkaProducerService {
  private producer: Producer;

  constructor() {
    const kafka = new Kafka(kafkaConfig);
    this.producer = kafka.producer();
  }

  async connect() {
    await this.producer.connect();
  }

  async disconnect() {
    await this.producer.disconnect();
  }

  async connectSafely() {
  try {
    await this.producer.connect();
    console.log('Kafka producer connected');
  } catch (err) {
    console.error('Kafka producer connection failed. Running in degraded mode.', err);
  }
}

  async publishLogs(logs: LogEvent[]) {
    if (logs.length === 0) return;

    console.log('Publishing to topic:', KAFKA_TOPICS.RAW_LOGS,[
        {
          value: JSON.stringify({
            logs,
            ingestedAt: new Date().toISOString(),
          }),
        },
      ]);


    await this.producer.send({
     topic: KAFKA_TOPICS.RAW_LOGS,
      messages: [
        {
          value: JSON.stringify({
            logs,
            ingestedAt: new Date().toISOString(),
          }),
        },
      ],
    });
  }
}

export const kafkaProducerService = new KafkaProducerService();
