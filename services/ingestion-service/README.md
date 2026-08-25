# Ingestion Service – Alerto

The **Ingestion Service** is the entry point of the Alerto platform. Its responsibility is to **receive logs from client applications**, validate them, persist raw data for durability, and **publish events to Kafka** for downstream processing.

This service is intentionally lightweight and highly available. It does **not** perform aggregation, alerting, or querying.

---

## Responsibilities

* Accept batched log events via HTTP APIs
* Validate request payloads using strict schemas
* Persist raw logs in MongoDB (unordered bulk inserts)
* Publish log batches to Kafka asynchronously
* Remain available even if Kafka is temporarily unavailable

---

## Non-Responsibilities

* Alert evaluation
* Time-window aggregation
* Querying or searching logs
* Notification delivery

---

## Architecture Overview

```
Client Apps
    ↓
POST /v1/logs
    ↓
Ingestion Service
  ├─ Zod validation
  ├─ MongoDB (raw logs)
  └─ Kafka (raw-log-events topic)
```

Kafka acts as a durable buffer between ingestion and downstream services.

---

## Tech Stack

* **Node.js** + **Express**
* **TypeScript (strict)**
* **MongoDB** (raw log storage)
* **Kafka** (event streaming)
* **KafkaJS** (Kafka client)
* **Zod** (schema validation)
* **Jest + Supertest** (testing)

---

## Folder Structure

```
src/
  app.ts                # Express app setup
  server.ts             # Server bootstrap
  routes/               # Route definitions
  controllers/          # Request handlers
  services/             # Business orchestration
  repositories/         # MongoDB access layer
  middlewares/          # Validation, auth, etc.
  schemas/              # Zod schemas
  config/               # Environment-based config
  utils/                # Shared utilities
```

---

## API Endpoints

### Health Check

```
GET /health
```

Response:

```json
{ "status": "OK" }
```

---

### Ingest Logs

```
POST /v1/logs
```

* Accepts **batched logs**
* Returns immediately with `202 Accepted`
* Kafka publishing happens asynchronously

#### Request Body

```json
{
  "logs": [
    {
      "timestamp": "2026-02-01T16:53:10.322Z",
      "service": "auth-service",
      "environment": "prod",
      "level": "ERROR",
      "message": "JWT verification failed",
      "errorCode": "AUTH_401",
      "entity": {
        "type": "user",
        "id": "u_12345"
      },
      "metadata": {
        "ip": "203.0.113.42",
        "traceId": "b3f1c7e2"
      }
    }
  ]
}
```

#### Required Fields per Log

* `timestamp` (ISO-8601 string)
* `service`
* `environment`
* `level`
* `message`

#### Optional Fields

* `errorCode`
* `entity` `{ type, id }`
* `metadata` (free-form object, unknown keys allowed)

#### Response

```json
{
  "status": "accepted",
  "ingestedCount": 1
}
```

HTTP Status: **202 Accepted**

---

## Failure Handling Guarantees

* Kafka downtime **does not** block ingestion
* MongoDB write is the source of durability
* Kafka publish failures are logged and retried asynchronously
* Clients always receive a response once validation passes

---

## Testing

### Run Tests

```bash
npm test
```

### What Is Covered

* Happy-path ingestion
* Schema validation failures
* Batch handling
* Kafka producer mocking

---

## Running Locally

### Install Dependencies

```bash
npm install
```

### Start Service (Dev)

```bash
npm run dev
```

Service runs at:

```
http://localhost:3000
```

---

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/alert-time
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=alert-time-ingestion-service
KAFKA_LOG_TOPIC=raw-log-events
```

Kafka is optional for local development; the service will continue ingesting logs even if Kafka is unavailable.

---

## Design Principles

* Separation of concerns
* High availability over strong consistency
* Async, non-blocking workflows
* Minimal API surface
* Production-first structure

---

## Next Services

* **Processing Service** – consumes raw logs from Kafka and performs time-window aggregation
* **Alerting Service** – manages alert lifecycle and state
* **Notification Service** – Slack, email, webhook delivery

---

## Status

**Ingestion Service v1 – Complete**

This service is production-ready for ingestion and event streaming responsibilities.
