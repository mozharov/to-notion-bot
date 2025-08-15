import {PostHog} from 'posthog-node'
import {config} from '../config.js'
import {logger} from './logger.js'

export const posthog = new PostHog(config.POSTHOG_API_KEY ?? '-', {
  host: 'https://eu.posthog.com',
  disabled: !config.POSTHOG_API_KEY,
})

posthog.on('error', (error: unknown) => {
  logger.error({error}, 'PostHog had an error!')
})
