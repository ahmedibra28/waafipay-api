// 5206 => payment has been cancelled
// 5310 => payment has been declined
// 2001 => payment has been done successfully

import { WaafiPayProp, WaafiPayResponse } from '@/types'

export const waafiPayPreAuthorize = async ({
  merchantUId,
  apiUId,
  apiKey,
  referenceId,
  description,
  amount,
  mobile,
}: WaafiPayProp): Promise<WaafiPayResponse & Error & { status: number }> => {
  try {
    const obj = {
      schemaVersion: '1.0',
      requestId: referenceId,
      timestamp: Date.now(),
      channelName: 'WEB',
      serviceName: 'API_PREAUTHORIZE',
      serviceParams: {
        merchantUid: merchantUId,
        apiUserId: apiUId,
        apiKey: apiKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: mobile,
        },
        transactionInfo: {
          referenceId,
          invoiceId: `${referenceId.slice(0, 5)}-${mobile}`,
          amount: Number(amount),
          currency: 'USD',
          description: description,
        },
      },
    }

    const data = await fetch('https://api.waafipay.net/asm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj),
    })

    if (!data.ok)
      throw {
        message: data.statusText || 'Failed to make pre-authorize request',
        status: data.status,
      }

    const response: WaafiPayResponse & Error & { status: number } =
      await data.json()

    if (response.responseCode !== '2001') {
      throw {
        message: response.params?.description || response.responseMsg,
        status: 500,
      }
    }

    return response
  } catch (error: any) {
    return error
  }
}
