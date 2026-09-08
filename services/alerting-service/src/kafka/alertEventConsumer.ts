import { Kafka } from 'kafkajs';
import { AlertingService } from '../service/alertingService';
import { AlertEvent } from '../types/alerts';

export class AlertEventConsumer {
  constructor(
    private readonly kafka: Kafka,
    private readonly alertingService: AlertingService,
  ) {}

  async start(topic = process.env.KAFKA_ALERT_TOPIC || 'alert-events'): Promise<void> {
    const consumer = this.kafka.consumer({ groupId: 'alerto-alerting-service' });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString()) as AlertEvent;
        await this.alertingService.handle(event);
      },
    });
  }
}
