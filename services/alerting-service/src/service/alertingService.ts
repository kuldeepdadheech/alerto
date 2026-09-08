import { AlertEvent, AlertRecord, AlertStore, NotificationProvider } from '../types/alerts';

export class AlertingService {
  constructor(
    private readonly store: AlertStore,
    private readonly notificationProvider: NotificationProvider,
  ) {}

  async handle(event: AlertEvent): Promise<AlertRecord> {
    const existing = await this.store.findActive(
      event.ruleId,
      event.service,
      event.environment,
    );

    if (existing) return existing;

    const record: AlertRecord = {
      ...event,
      status: 'ACTIVE',
    };

    await this.store.save(record);
    await this.notificationProvider.notify(record);
    record.notifiedAt = new Date().toISOString();
    await this.store.save(record);
    return record;
  }
}

export class InMemoryAlertStore implements AlertStore {
  private readonly records: AlertRecord[] = [];

  async save(record: AlertRecord): Promise<void> {
    const index = this.records.findIndex((item) => item.id === record.id);
    if (index === -1) this.records.push({ ...record });
    else this.records[index] = { ...record };
  }

  async findActive(
    ruleId: string,
    service: string,
    environment: string,
  ): Promise<AlertRecord | undefined> {
    return this.records.find(
      (record) =>
        record.ruleId === ruleId &&
        record.service === service &&
        record.environment === environment &&
        record.status === 'ACTIVE',
    );
  }

  async list(): Promise<AlertRecord[]> {
    return this.records.map((record) => ({ ...record }));
  }
}

export class LoggingNotificationProvider implements NotificationProvider {
  async notify(record: AlertRecord): Promise<void> {
    console.log(`Alert triggered: ${record.ruleName} (${record.count}/${record.threshold})`);
  }
}
