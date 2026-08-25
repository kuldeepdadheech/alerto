export const kafkaConfig = {
  clientId: 'alert-time-ingestion-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
};
