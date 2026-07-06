export type RecurringSubscriptionPeriod = 'month' | 'year'

export function extendSubscriptionEndDate(
  currentEndDate: Date | null,
  period: RecurringSubscriptionPeriod,
): Date {
  const startDate = currentEndDate && currentEndDate > new Date() ? currentEndDate : new Date()
  const endDate = new Date(startDate)
  if (period === 'month') endDate.setMonth(endDate.getMonth() + 1)
  else endDate.setFullYear(endDate.getFullYear() + 1)
  return endDate
}
