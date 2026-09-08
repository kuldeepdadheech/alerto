import { AlertRecord, NotificationProvider } from '../types/alerts';

export class WebhookNotificationProvider implements NotificationProvider {
  constructor(private readonly url: string) {}

  async notify(record: AlertRecord): Promise<void> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed with status ${response.status}`);
    }
  }
}
