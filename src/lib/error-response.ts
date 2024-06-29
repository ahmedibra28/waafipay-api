import { Context } from 'hono'
import { BlankEnv, BlankInput } from 'hono/types'

export function getErrorResponse(
  c: Context<BlankEnv, '/api/v1/transactions/initialize', BlankInput>,
  error: string | null = null,
  status: number = 500
) {
  return c.json(
    {
      status: status < 500 ? 'fail' : 'error',
      error: error ? error : null,
    },
    {
      status,
    }
  )
}
