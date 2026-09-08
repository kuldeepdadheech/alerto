import { Kafka } from 'kafkajs';
import { ThresholdEvaluator } from '../rules/thresholdEvaluator';
import { AlertEvent, LogEvent } from '../types/events';

interface RawLogMessage {
  logs: LogEvent[];
}

export class RawLogConsumer {
  constructor(
    private readonly kafka: Kafka,
    private readonly evaluator: ThresholdEvaluator,
    private readonly onAlert: (event: AlertEvent) => Promise<void>,
  ) {}

  async start(topic = process.env.KAFKA_LOG_TOPIC || 'raw-logs'): Promise<void> {
    const consumer = this.kafka.consumer({ groupId: 'alerto-processing-service' });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const payload = JSON.parse(message.value.toString()) as RawLogMessage;
        for (const log of payload.logs) {
          for (const alert of this.evaluator.process(log)) {
            await this.onAlert(alert);
          }
        }
      },
    });
  }
}
