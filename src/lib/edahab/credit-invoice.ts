// 0 => payment has been done successfully

import { EDahabCreditInvoiceProp, EDahabCreditInvoiceResponse } from '@/types'
import { enc } from 'crypto-js'
import sha256 from 'crypto-js/sha256'

export const eDahabPayCreditInvoice = async ({
  apiKey,
  phoneNumber,
  transactionAmount,
  currency,
  secret,
  transactionId,
}: EDahabCreditInvoiceProp): Promise<
  EDahabCreditInvoiceResponse & Error & { status: number }
> => {
  try {
    const obj = {
      apiKey,
      phoneNumber,
      transactionAmount,
      currency,
      transactionId,
    }

    const hash = sha256(JSON.stringify(obj) + secret).toString(enc.Hex)

    const data = await fetch(
      `https://edahab.net/api/api/agentPayment?hash=${hash}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj),
      }
    )

    if (!data.ok)
      throw {
        message: data.statusText || 'Failed to make credit invoice request',
        status: data.status,
      }

    const response: EDahabCreditInvoiceResponse & Error & { status: number } =
      await data.json()

    if (response.TransactionStatus !== 'Approved') {
      throw {
        message:
          response.TransactionMesage || 'Failed to make credit invoice request',
        status: 500,
      }
    }

    return response
  } catch (error: any) {
    return error
  }
}
