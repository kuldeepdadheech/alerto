import { AlertingService, InMemoryAlertStore } from '../service/alertingService';
import { AlertEvent, NotificationProvider } from '../types/alerts';

const event: AlertEvent = {
  id: 'auth-errors:1',
  ruleId: 'auth-errors',
  ruleName: 'Auth errors',
  service: 'auth-service',
  environment: 'prod',
  count: 2,
  threshold: 2,
  windowSeconds: 60,
  firstSeenAt: '2026-09-08T11:59:30.000Z',
  triggeredAt: '2026-09-08T12:00:00.000Z',
  sample: {},
};

describe('AlertingService', () => {
  it('stores and notifies a new alert', async () => {
    const store = new InMemoryAlertStore();
    const notify = jest.fn().mockResolvedValue(undefined) as jest.MockedFunction<NotificationProvider['notify']>;
    const service = new AlertingService(store, { notify });

    const record = await service.handle(event);

    expect(record.status).toBe('ACTIVE');
    expect(record.notifiedAt).toBeDefined();
    expect(notify).toHaveBeenCalledTimes(1);
    expect(await store.list()).toHaveLength(1);
  });

  it('does not notify the same active alert twice', async () => {
    const store = new InMemoryAlertStore();
    const notify = jest.fn().mockResolvedValue(undefined);
    const service = new AlertingService(store, { notify });

    await service.handle(event);
    await service.handle({ ...event, id: 'auth-errors:2' });

    expect(notify).toHaveBeenCalledTimes(1);
    expect(await store.list()).toHaveLength(1);
  });
});
