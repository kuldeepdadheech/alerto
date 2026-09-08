import { Kafka } from 'kafkajs';
import { AlertEventConsumer } from './kafka/alertEventConsumer';
import {
  AlertingService,
  InMemoryAlertStore,
  LoggingNotificationProvider,
} from './service/alertingService';

const kafka = new Kafka({
  clientId: 'alerto-alerting-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const service = new AlertingService(
  new InMemoryAlertStore(),
  new LoggingNotificationProvider(),
);
const consumer = new AlertEventConsumer(kafka, service);

consumer.start().then(() => {
  console.log('Alerting service started');
}).catch((error) => {
  console.error('Alerting service failed to start', error);
  process.exitCode = 1;
});
