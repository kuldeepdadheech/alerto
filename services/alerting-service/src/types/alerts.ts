export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  service: string;
  environment: 'dev' | 'staging' | 'prod';
  count: number;
  threshold: number;
  windowSeconds: number;
  firstSeenAt: string;
  triggeredAt: string;
  sample: Record<string, unknown>;
}

export interface AlertRecord extends AlertEvent {
  status: 'ACTIVE' | 'RESOLVED';
  notifiedAt?: string;
  resolvedAt?: string;
}

export interface AlertStore {
  save(record: AlertRecord): Promise<void>;
  findActive(ruleId: string, service: string, environment: string): Promise<AlertRecord | undefined>;
  list(): Promise<AlertRecord[]>;
}

export interface NotificationProvider {
  notify(record: AlertRecord): Promise<void>;
}
