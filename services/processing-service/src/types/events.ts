export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEvent {
  timestamp: string;
  service: string;
  environment: 'dev' | 'staging' | 'prod';
  level: LogLevel;
  message: string;
  errorCode?: string;
  entity?: { type: string; id: string };
  metadata?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  service?: string;
  environment?: LogEvent['environment'];
  level?: LogLevel;
  threshold: number;
  windowSeconds: number;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  service: string;
  environment: LogEvent['environment'];
  count: number;
  threshold: number;
  windowSeconds: number;
  firstSeenAt: string;
  triggeredAt: string;
  sample: LogEvent;
}
