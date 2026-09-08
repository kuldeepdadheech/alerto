import { AlertEvent, AlertRule, LogEvent } from '../types/events';

interface WindowState {
  events: LogEvent[];
  active: boolean;
}

export class ThresholdEvaluator {
  private readonly windows = new Map<string, WindowState>();

  constructor(private readonly rules: AlertRule[]) {
    for (const rule of rules) {
      if (rule.threshold < 1 || rule.windowSeconds < 1) {
        throw new Error(`Invalid rule ${rule.id}`);
      }
    }
  }

  process(log: LogEvent, now = new Date()): AlertEvent[] {
    const alerts: AlertEvent[] = [];

    for (const rule of this.rules) {
      if (!this.matches(rule, log)) continue;

      const key = this.key(rule, log);
      const state = this.windows.get(key) ?? { events: [], active: false };
      const cutoff = now.getTime() - rule.windowSeconds * 1000;
      state.events = state.events.filter(
        (event) => new Date(event.timestamp).getTime() >= cutoff,
      );
      state.events.push(log);

      if (state.events.length < rule.threshold) {
        state.active = false;
      } else if (!state.active) {
        state.active = true;
        alerts.push({
          id: `${rule.id}:${now.toISOString()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          service: log.service,
          environment: log.environment,
          count: state.events.length,
          threshold: rule.threshold,
          windowSeconds: rule.windowSeconds,
          firstSeenAt: state.events[0].timestamp,
          triggeredAt: now.toISOString(),
          sample: log,
        });
      }

      this.windows.set(key, state);
    }

    return alerts;
  }

  private matches(rule: AlertRule, log: LogEvent): boolean {
    return (
      (!rule.service || rule.service === log.service) &&
      (!rule.environment || rule.environment === log.environment) &&
      (!rule.level || rule.level === log.level)
    );
  }

  private key(rule: AlertRule, log: LogEvent): string {
    return `${rule.id}:${log.service}:${log.environment}`;
  }
}
