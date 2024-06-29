import { Hono } from 'hono'
import { waafiPayPurchase } from './lib/waafipay/purchase'
import { getErrorResponse } from './lib/error-response'
import {
  isValidApiKey,
  isValidateWithdrawAccount,
  isValidHormuudSomnet,
} from './lib/valid'
import { v4 as uuidv4 } from 'uuid'
import { waafiPayWithdraw } from './lib/waafipay/withdraw'
import { waafiPayRefund } from './lib/waafipay/refund'

const app = new Hono().basePath('/api/v1')

app.post('/transactions/initialize', async (c) => {
  try {
    const { mobile, amount, customReference, description, credentials } =
      (await c.req.json()) as {
        mobile: string
        amount: number
        customReference?: string
        description?: string
        credentials: {
          merchantUId: string
          apiUId: string
          apiKey: string
          accountNumberToWithdraw: string
        }
      }

    if (!amount) return getErrorResponse(c, `Missing amount`, 400)
    if (Number(amount) <= 0)
      return getErrorResponse(c, `Amount must be greater than 0`, 400)

    if (!mobile) return getErrorResponse(c, `Missing mobile`, 400)

    if (!isValidHormuudSomnet(mobile))
      return getErrorResponse(c, `Mobile number is not valid`, 400)

    if (!credentials) return getErrorResponse(c, `Missing credentials`, 400)

    // check if the credentials are valid
    const { merchantUId, apiUId, apiKey } = credentials
    if (!merchantUId || !apiUId || !apiKey)
      return getErrorResponse(c, `Missing credentials`, 400)

    if (!isValidApiKey(credentials.apiKey)) {
      return getErrorResponse(c, 'API key is not valid', 400)
    }

    if (
      credentials?.accountNumberToWithdraw &&
      !isValidateWithdrawAccount(credentials?.accountNumberToWithdraw)
    ) {
      return getErrorResponse(c, 'Account number to withdraw is not valid', 400)
    }

    const referenceId = uuidv4()

    const waafiPayObject = {
      merchantUId: merchantUId,
      apiUId: apiUId,
      apiKey: apiKey,
      referenceId,
      amount,
      mobile,
    }

    const purchaseDescription = `${mobile} has paid ${amount} dollars`
    const withdrawalDescription = `${amount} dollars has been withdrawn to ${credentials?.accountNumberToWithdraw} via system`

    const response = await waafiPayPurchase({
      ...waafiPayObject,
      description: description || purchaseDescription,
    })

    if (response.status === 500) {
      return getErrorResponse(c, response.message, 500)
    }

    let withdrawResponse: any = null

    if (credentials?.accountNumberToWithdraw) {
      const withdraw = await waafiPayWithdraw({
        ...waafiPayObject,
        description: description || withdrawalDescription,
        accountNumberToWithdraw: credentials?.accountNumberToWithdraw,
      })

      if (withdraw.status === 500) {
        withdrawResponse = {
          error: withdraw.message,
        }
      }
    }

    const newResponse = {
      id: referenceId,
      timestamp: response.timestamp,
      transactionId: response.params?.transactionId,
      referenceId: response.params?.referenceId,
      amount: response.params?.txAmount,
      mobile,
      customReference,
      description: description || purchaseDescription,
      message: 'Payment has been done successfully',
      ...(withdrawResponse && {
        withdraw: {
          error: withdrawResponse?.error,
        },
      }),
    }

    return c.json(newResponse)
  } catch ({ status = 500, message }: any) {
    return c.json(
      {
        status: status < 500 ? 'fail' : 'error',
        error: message ? message : null,
      },
      {
        status,
      }
    )
  }
})

app.post('/transactions/refund', async (c) => {
  try {
    const { customReference, transactionId, reason, amount, credentials } =
      (await c.req.json()) as {
        customReference?: string
        transactionId: number | string
        amount: number
        reason: string
        credentials: {
          merchantUId: string
          apiUId: string
          apiKey: string
        }
      }

    if (!transactionId) return getErrorResponse(c, `Missing transactionId`, 400)
    if (!reason) return getErrorResponse(c, `Missing reason`, 400)
    if (!amount) return getErrorResponse(c, `Missing amount`, 400)
    if (Number(amount) <= 0)
      return getErrorResponse(c, `Amount must be greater than 0`, 400)
    if (!credentials) return getErrorResponse(c, `Missing credentials`, 400)

    // check if the credentials are valid
    const { merchantUId, apiUId, apiKey } = credentials
    if (!merchantUId || !apiUId || !apiKey)
      return getErrorResponse(c, `Missing credentials`, 400)

    if (!isValidApiKey(credentials.apiKey)) {
      return getErrorResponse(c, 'API key is not valid', 400)
    }

    const referenceId = uuidv4()

    const response = await waafiPayRefund({
      merchantUId: credentials.merchantUId,
      apiUId: credentials.apiUId,
      apiKey: credentials.apiKey,
      referenceId,
      amount: Number(amount),
      transactionId: Number(transactionId),
      description: reason,
    })

    if (response.status === 500) {
      return getErrorResponse(c, response.message, 500)
    }

    const newResponse = {
      id: referenceId,
      timestamp: response.timestamp,
      transactionId: response.params?.transactionId,
      referenceId: response.params?.referenceId,
      customReference,
      description: reason || response.params?.description,
      message: 'Refund has been done successfully',
    }

    return c.json(newResponse)
  } catch ({ status = 500, message }: any) {
    return c.json(
      {
        status: status < 500 ? 'fail' : 'error',
        error: message ? message : null,
      },
      {
        status,
      }
    )
  }
})

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

export default app
