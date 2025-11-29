// 5206 => payment has been cancelled
// 5310 => payment has been declined
// 2001 => payment has been done successfully

import { WaafiPayProp, WaafiPayResponse } from '@/types'
import axios from 'axios'

export const waafiPayRefund = async ({
  merchantUId,
  apiUId,
  apiKey,
  referenceId,
  transactionId,
  description,
  amount,
}: WaafiPayProp): Promise<WaafiPayResponse & { status?: number }> => {
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

    const { data }: { data: WaafiPayResponse } = await axios.post(
      'https://api.waafipay.net/asm',
      refundObject,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (data.responseCode !== '2001' || !data?.params?.transactionId) {
      throw {
        message: data.params?.description || data.responseMsg,
        status: 500,
      }
    }

    return data
  } catch (error: any) {
    return {
      ...error?.response?.data,
      status: error?.response?.status || 500,
      responseMsg: error.message || 'Failed to make refund request',
    }
  }
}
