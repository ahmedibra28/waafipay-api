// 5206 => payment has been cancelled
// 5310 => payment has been declined
// 2001 => payment has been done successfully

import { WaafiPayProp, WaafiPayResponse } from '@/types'

export const waafiPayWithdraw = async ({
  merchantUId,
  apiUId,
  apiKey,
  accountNumberToWithdraw,
  referenceId,
  description,
  amount,
  mobile,
}: WaafiPayProp): Promise<WaafiPayResponse & Error & { status: number }> => {
  try {
    const isWithdrawable = Boolean(accountNumberToWithdraw)
    let withdrawTo = ''
    if (isWithdrawable) {
      if (accountNumberToWithdraw?.startsWith('1')) {
        withdrawTo = 'MERCHANT'
      } else {
        withdrawTo = 'CUSTOMER'
      }
    }

    const providerCommissionAmount = Number(amount) * 0.02

    const withdrawalObject = {
      schemaVersion: '1.0',
      requestId: referenceId,
      timestamp: Date.now(),
      channelName: 'WEB',
      serviceName: 'API_CREDITACCOUNT',
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

    const data = await fetch('https://api.waafipay.net/asm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(withdrawalObject),
    })

    if (!data.ok)
      throw {
        message: data.statusText || 'Failed to make withdrawal request',
        status: data.status,
      }

    const response = await data.json()

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
