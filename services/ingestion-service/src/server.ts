import app from './app';
import { createMongoLogStore } from './config/mongo.config';
import { kafkaProducerService } from './services/kafkaProducer.service';
import { logIngestionService } from './services/logIngestion.service';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  kafkaProducerService.connectSafely();

  try {
    const mongoStore = await createMongoLogStore();
    if (mongoStore) {
      logIngestionService.setRepository(mongoStore.repository);
      console.log('MongoDB log storage connected');
    } else {
      console.warn('MONGODB_URI is not set. Running with in-memory log storage.');
    }
  } catch (error) {
    console.error('MongoDB connection failed. Running with in-memory log storage.', error);
  }

  app.listen(PORT, () => {
    console.log(`Ingestion service running on port ${PORT}`);
  });
};

startServer();
