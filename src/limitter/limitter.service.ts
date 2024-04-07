import Bottleneck from 'bottleneck'

export const notionApiLimitter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 340,
})
