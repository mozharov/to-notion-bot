import {posthog} from '../../lib/posthog.js'

export class Tracker {
  constructor(private readonly distinctId?: string) {}

  public identify(properties?: Properties) {
    if (!this.distinctId) return
    posthog.identify({distinctId: this.distinctId, properties})
  }

  public capture(event: string, properties?: Properties) {
    if (!this.distinctId) return
    posthog.capture({event, distinctId: this.distinctId, properties})
  }
}

interface Properties {
  [key: string]: boolean | number | string | Properties | undefined | null
}
