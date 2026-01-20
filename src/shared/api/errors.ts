export type ApiErrorPayload = {
  status_code: number
  detail: string
  extra?: unknown
}

export class ApiError extends Error {
  name = 'ApiError' as const
  status: number
  url: string
  payload?: ApiErrorPayload

  constructor(args: {
    status: number
    url: string
    message: string
    payload?: ApiErrorPayload
  }) {
    super(args.message)
    this.status = args.status
    this.url = args.url
    this.payload = args.payload
  }
}

export class AuthRequiredError extends Error {
  name = 'AuthRequiredError' as const

  constructor(message = 'Authentication required') {
    super(message)
  }
}
