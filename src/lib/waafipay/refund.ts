// 5206 => payment has been cancelled
// 5310 => payment has been declined
// 2001 => payment has been done successfully

import { WaafiPayProp, WaafiPayResponse } from '@/types'

export const waafiPayRefund = async ({
  merchantUId,
  apiUId,
  apiKey,
  referenceId,
  transactionId,
  description,
  amount,
}: WaafiPayProp): Promise<WaafiPayResponse & Error & { status: number }> => {
  try {
    const refundObject = {
      schemaVersion: '1.0',
      requestId: referenceId,
      timestamp: Date.now(),
      channelName: 'WEB',
      serviceName: 'API_REFUND',
      serviceParams: {
        merchantUid: merchantUId,
        apiUserId: apiUId,
        apiKey: apiKey,
        transactionId,
        amount: Number(amount),
        description,
      },
    }

    const data = await fetch('https://api.waafipay.net/asm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundObject),
    })

    if (!data.ok)
      throw {
        message: data.statusText || 'Failed to make refund request',
        status: data.status,
      }

    const response: WaafiPayResponse & Error & { status: number } =
      await data.json()

    if (response.responseCode !== '2001' && !response?.params?.transactionId) {
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
