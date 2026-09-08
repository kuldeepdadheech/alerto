import { ThresholdEvaluator } from '../rules/thresholdEvaluator';
import { AlertRule, LogEvent } from '../types/events';

const rule: AlertRule = {
  id: 'auth-errors',
  name: 'Auth errors',
  service: 'auth-service',
  level: 'ERROR',
  threshold: 2,
  windowSeconds: 60,
};

const log = (timestamp: string): LogEvent => ({
  timestamp,
  service: 'auth-service',
  environment: 'prod',
  level: 'ERROR',
  message: 'JWT verification failed',
});

describe('ThresholdEvaluator', () => {
  it('triggers when the threshold is reached in the window', () => {
    const evaluator = new ThresholdEvaluator([rule]);
    const now = new Date('2026-09-08T12:00:00.000Z');

    expect(evaluator.process(log('2026-09-08T11:59:30.000Z'), now)).toHaveLength(0);
    const alerts = evaluator.process(log('2026-09-08T11:59:45.000Z'), now);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].count).toBe(2);
  });

  it('does not emit duplicate alerts while a window remains active', () => {
    const evaluator = new ThresholdEvaluator([rule]);
    const now = new Date('2026-09-08T12:00:00.000Z');

    evaluator.process(log('2026-09-08T11:59:30.000Z'), now);
    evaluator.process(log('2026-09-08T11:59:45.000Z'), now);

    expect(evaluator.process(log('2026-09-08T11:59:50.000Z'), now)).toHaveLength(0);
  });

  it('resets after the configured window expires', () => {
    const evaluator = new ThresholdEvaluator([rule]);

    evaluator.process(log('2026-09-08T11:59:30.000Z'), new Date('2026-09-08T12:00:00.000Z'));
    evaluator.process(log('2026-09-08T11:59:45.000Z'), new Date('2026-09-08T12:00:00.000Z'));

    expect(
      evaluator.process(log('2026-09-08T12:01:30.000Z'), new Date('2026-09-08T12:01:30.000Z')),
    ).toHaveLength(0);
  });
});
