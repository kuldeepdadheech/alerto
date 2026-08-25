import request from "supertest";
import app from "../app";
import { kafkaProducerService } from "../services/kafkaProducer.service";
import { LogRepository } from "../repositories/log.repository";

jest.mock('../services/kafkaProducer.service', () => {
  kafkaProducerService: {
    publishLogs: jest.fn().mockResolvedValue(undefined);
    connect: jest.fn();
  }
});

jest.mock('../repositories/log.repository', () => {
  LogRepository: jest.fn().mockImplementation(() => {
    insertMany: jest.fn().mockResolvedValue({})
  })
})

describe('POST /v1/logs', () => {
  it('accepts valid log batch and returns 202', async () => {
    const res = await request(app)
      .post('/v1/logs')
      .send({
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
              "userAgent": "Mozilla/5.0",
              "traceId": "b3f1c7e2e8c4",
              "requestId": "req_789",
              "retry": false
            }
          },
          {
            "timestamp": "2026-02-01T16:53:11.101Z",
            "service": "auth-service",
            "environment": "prod",
            "level": "WARN",
            "message": "Slow password hash detected",
            "metadata": {
              "hashDurationMs": 742,
              "thresholdMs": 500
            }
          }
        ]
      }
      )
    expect(res.status).toBe(202);
    expect(res.body.ingestedCount).toBeGreaterThan(0);
  })

  it('does not accept invalid log and returns 400', async () => {
    const res = await request(app)
      .post('/v1/logs')
      .send({
        "logs": [
          {
            "timestamp": "2026-02-01T16:53:10.322Z",
            "service": "auth-service",
            "environment": "prod",
            "level": "ERROR"
          }
        ]
      })
    expect(res.status).toBe(400);
  })
})
