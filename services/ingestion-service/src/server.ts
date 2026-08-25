import app from './app';
import { kafkaProducerService } from './services/kafkaProducer.service';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  kafkaProducerService.connectSafely();

  app.listen(PORT, () => {
    console.log(`Ingestion service running on port ${PORT}`);
  });
};

startServer();
