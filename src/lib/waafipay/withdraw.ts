// 5206 => payment has been cancelled
// 5310 => payment has been declined
// 2001 => payment has been done successfully

import { WaafiPayProp, WaafiPayResponse } from '@/types'
import axios from 'axios'

export const waafiPayWithdraw = async ({
  merchantUId,
  apiUId,
  apiKey,
  accountNumberToWithdraw,
  referenceId,
  description,
  amount,
  mobile,
}: WaafiPayProp): Promise<WaafiPayResponse & { status?: number }> => {
  try {
    const isWithdrawable = Boolean(accountNumberToWithdraw)
    let withdrawTo = ''
    if (isWithdrawable) {
      if (accountNumberToWithdraw?.length === 6) {
        withdrawTo = 'MERCHANT'
      } else {
        withdrawTo = 'CUSTOMER'
      }
    }

    // INFO: Allow this if WaafiPay changes their commission structure

    const commission = Number(amount) <= 0.18 ? 0 : 0.02
    const providerCommissionAmount = Number(amount) * commission

    const withdrawalObject = {
      schemaVersion: '1.0',
      requestId: referenceId,
      timestamp: Date.now(),
      channelName: 'WEB',
      serviceName: 'API_CREDIT_MERCHANT',
      serviceParams: {
        merchantUid: merchantUId,
        apiUserId: apiUId,
        apiKey: apiKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: accountNumberToWithdraw,
          accountType: withdrawTo,
        },
        transactionInfo: {
          referenceId,
          invoiceId: `${referenceId.slice(0, 5)}-${mobile}`,
          amount: Number(amount) - providerCommissionAmount,
          currency: 'USD',
          description,
        },
      },
    }

    const { data }: { data: WaafiPayResponse } = await axios.post(
      'https://api.waafipay.net/asm',
      withdrawalObject,
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
      responseMsg: error.message || 'Failed to make withdrawal request',
    }
  }
}
