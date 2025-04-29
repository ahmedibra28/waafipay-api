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
import { waafiPayPreAuthorize } from './lib/waafipay/pre-authorize'
import { waafiPayPreAuthorizeCommit } from './lib/waafipay/pre-authorize-commit'
import { waafiPayPreAuthorizeCancel } from './lib/waafipay/pre-authorize-cancel'

const app = new Hono().basePath('/api/v1')

app.get('/', (c) => {
  return c.json({ message: 'Welcome to WaafiPay API (v2) 🚀' })
})

app.post('/payments/initialize', async (c) => {
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
        description: withdrawalDescription,
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
      charges: response.params?.merchantCharges,
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

app.post('/payments/refund', async (c) => {
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

app.post('/payments/pre-authorize', async (c) => {
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

    const referenceId = uuidv4()

    const purchaseDescription = `${mobile} has paid ${amount} dollars`

    const response = await waafiPayPreAuthorize({
      merchantUId: merchantUId,
      apiUId: apiUId,
      apiKey: apiKey,
      referenceId,
      amount,
      mobile,
      description: description || purchaseDescription,
    })

    if (response.status === 500) {
      return getErrorResponse(c, response.message, 500)
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

app.post('/payments/pre-authorize/commit', async (c) => {
  try {
    const {
      customReference,
      transactionId,
      description,
      credentials,
      amount,
      mobile,
    } = (await c.req.json()) as {
      mobile: string
      amount: number
      customReference?: string
      transactionId: number | string
      description?: string
      credentials: {
        merchantUId: string
        apiUId: string
        apiKey: string
        accountNumberToWithdraw?: string
      }
    }

    if (!transactionId) return getErrorResponse(c, `Missing transactionId`, 400)
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
      merchantUId: credentials.merchantUId,
      apiUId: credentials.apiUId,
      apiKey: credentials.apiKey,
      referenceId,
      amount,
    }

    const response = await waafiPayPreAuthorizeCommit({
      ...waafiPayObject,
      amount: 0,
      transactionId: Number(transactionId),
      description: description || `Pre-authorized commit for ${transactionId}`,
    })

    if (response.status === 500) {
      return getErrorResponse(c, response.message, 500)
    }

    let withdrawResponse: any = null

    if (credentials?.accountNumberToWithdraw) {
      const withdraw = await waafiPayWithdraw({
        ...waafiPayObject,
        description:
          description ||
          `${amount} dollars has been withdrawn to ${credentials?.accountNumberToWithdraw} via system`,
        accountNumberToWithdraw: credentials?.accountNumberToWithdraw,
        mobile,
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
      customReference,
      description: description || response.params?.description,
      message: 'Pre-authorized commit has been done successfully',
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

app.post('/payments/pre-authorize/cancel', async (c) => {
  try {
    const { customReference, transactionId, description, credentials } =
      (await c.req.json()) as {
        customReference?: string
        transactionId: number | string
        description?: string
        credentials: {
          merchantUId: string
          apiUId: string
          apiKey: string
        }
      }

    if (!transactionId) return getErrorResponse(c, `Missing transactionId`, 400)
    if (!credentials) return getErrorResponse(c, `Missing credentials`, 400)

    // check if the credentials are valid
    const { merchantUId, apiUId, apiKey } = credentials
    if (!merchantUId || !apiUId || !apiKey)
      return getErrorResponse(c, `Missing credentials`, 400)

    if (!isValidApiKey(credentials.apiKey)) {
      return getErrorResponse(c, 'API key is not valid', 400)
    }

    const referenceId = uuidv4()

    const response = await waafiPayPreAuthorizeCancel({
      merchantUId: credentials.merchantUId,
      apiUId: credentials.apiUId,
      apiKey: credentials.apiKey,
      referenceId,
      amount: 0,
      transactionId: Number(transactionId),
      description: description || `Pre-authorized cancel for ${transactionId}`,
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
      description: description || response.params?.description,
      message: 'Pre-authorized cancel has been done successfully',
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

app.post('/payments/withdraw', async (c) => {
  try {
    const { amount, description, credentials } = (await c.req.json()) as {
      amount: number
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
    }

    const withdrawalDescription = `${amount} dollars has been withdrawn to ${credentials?.accountNumberToWithdraw} via system`

    const withdraw = await waafiPayWithdraw({
      ...waafiPayObject,
      description: description || withdrawalDescription,
      accountNumberToWithdraw: credentials?.accountNumberToWithdraw,
      business: undefined,
    })

    if (withdraw.status === 500) {
      return getErrorResponse(c, withdraw.message, 500)
    }

    const newResponse = {
      id: referenceId,
      timestamp: withdraw.timestamp,
      transactionId: withdraw.params?.transactionId,
      referenceId: withdraw.params?.referenceId,
      amount: withdraw.params?.txAmount,
      description: description || withdrawalDescription,
      message: 'Withdrawal has been done successfully',
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
