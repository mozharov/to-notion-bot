import {posthog} from '../../lib/posthog.js'

export class Tracker {
  private pendingPersonProperties?: Properties

  constructor(private readonly distinctId?: string) {}

  public identify(properties?: Properties) {
    if (!this.distinctId) return
    posthog.identify({distinctId: this.distinctId, properties})
  }

  // Queues person-property updates to piggyback as $set on this update's next capture() call,
  // instead of sending a dedicated $identify event on every single update.
  public setPersonProperties(properties: Properties) {
    this.pendingPersonProperties = properties
  }

  public alias(previousDistinctId: string) {
    if (!this.distinctId) return
    posthog.alias({distinctId: this.distinctId, alias: previousDistinctId})
  }

  public capture(event: string, properties?: Properties) {
    if (!this.distinctId) return
    const $set = this.pendingPersonProperties
    this.pendingPersonProperties = undefined
    posthog.capture({
      event,
      distinctId: this.distinctId,
      properties: $set ? {...properties, $set} : properties,
    })
  }
}

interface Properties {
  [key: string]: boolean | number | string | Properties | undefined | null
}
