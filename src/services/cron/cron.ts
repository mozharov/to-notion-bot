import cron from 'node-cron'
import {logger} from '../../lib/logger.js'
import {checkSubscriptions} from './tasks/check-subscriptions.js'

let isCheckSubscriptionsRunning = false

export function startCronJobs() {
  // Run every day at 14 PM UTC
  cron.schedule(
    '0 14 * * *',
    () => {
      logger.info('Running subscription check cron job')
      if (isCheckSubscriptionsRunning) {
        logger.warn('Subscription check cron job is already running')
        return
      }
      isCheckSubscriptionsRunning = true
      checkSubscriptions()
        .catch((error: unknown) => {
          logger.error({error}, 'Error running subscription check cron job')
        })
        .finally(() => {
          isCheckSubscriptionsRunning = false
        })
    },
    {runOnInit: true},
  )

  logger.info('Cron jobs started')
}
