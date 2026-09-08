import { Kafka } from 'kafkajs';
import { RawLogConsumer } from './kafka/rawLogConsumer';
import { ThresholdEvaluator } from './rules/thresholdEvaluator';
import { AlertRule } from './types/events';

const kafka = new Kafka({
  clientId: 'alerto-processing-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const rule: AlertRule = {
  id: process.env.ALERT_RULE_ID || 'error-threshold',
  name: process.env.ALERT_RULE_NAME || 'Error threshold',
  service: process.env.ALERT_SERVICE,
  environment: (process.env.ALERT_ENVIRONMENT as AlertRule['environment']) || undefined,
  level: 'ERROR',
  threshold: Number(process.env.ALERT_THRESHOLD || 5),
  windowSeconds: Number(process.env.ALERT_WINDOW_SECONDS || 60),
};

const producer = kafka.producer();
const evaluator = new ThresholdEvaluator([rule]);
const consumer = new RawLogConsumer(kafka, evaluator, async (event) => {
  await producer.send({
    topic: process.env.KAFKA_ALERT_TOPIC || 'alert-events',
    messages: [{ value: JSON.stringify(event) }],
  });
});

async function start(): Promise<void> {
  await producer.connect();
  await consumer.start();
  console.log('Processing service started');
}

start().catch((error) => {
  console.error('Processing service failed to start', error);
  process.exitCode = 1;
});
