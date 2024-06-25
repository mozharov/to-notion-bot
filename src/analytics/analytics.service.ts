import {PostHog} from 'posthog-node'
import {config} from '../config/config.service'

const shutdownTimeoutMs = 10000

class AnalyticsService {
  private readonly client: PostHog

  constructor() {
    this.client = new PostHog(config.get('POSTHOG_API_KEY'), {
      host: 'https://eu.posthog.com',
      flushInterval: 0,
      flushAt: 1,
    })
  }

  public identify(telegramUserId: number, properties: Properties): void {
    this.client.identify({
      distinctId: telegramUserId.toString(),
      properties,
    })
  }

  public track(event: string, telegramUserId: number, properties?: Properties): void {
    this.client.capture({
      distinctId: telegramUserId.toString(),
      event,
      properties,
    })
  }

  public shutdown(): Promise<void> {
    return this.client.shutdown(shutdownTimeoutMs)
  }
}

export const analytics = new AnalyticsService()

interface Properties {
  [key: string]: boolean | number | string | Properties | undefined | null
}
