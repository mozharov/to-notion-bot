export class KnownError extends Error {
  public translationKey: string
  public translationParams?: Record<string, string | number>

  constructor(options: ConstructorOptions) {
    super()
    this.name = KnownError.name
    this.message = options.message ?? 'Known error'
    this.translationKey = options.translationKey
    this.translationParams = options.translationParams
  }
}

export interface KnownErrorOptions {
  message?: string
}

interface ConstructorOptions extends KnownErrorOptions {
  translationKey: string
  translationParams?: Record<string, string | number>
}
