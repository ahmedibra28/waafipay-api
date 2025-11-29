// 0 => payment has been done successfully

import { EDahabCreditInvoiceProp, EDahabCreditInvoiceResponse } from '@/types'
import { enc } from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import axios from 'axios'

export const eDahabPayCreditInvoice = async ({
  apiKey,
  phoneNumber,
  transactionAmount,
  currency,
  secret,
  transactionId,
}: EDahabCreditInvoiceProp): Promise<
  EDahabCreditInvoiceResponse & { status?: number }
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

    const { data }: { data: EDahabCreditInvoiceResponse } = await axios.post(
      `https://edahab.net/api/api/agentPayment?hash=${hash}`,
      obj,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (data.TransactionStatus !== 'Approved') {
      throw {
        message:
          data.TransactionMesage || 'Failed to make credit invoice request',
        status: 500,
      }
    }

    return data
  } catch (error: any) {
    return {
      ...error?.response?.data,
      status: error?.response?.status || 500,
      message: error.message || 'Failed to make credit invoice request',
    }
  }
}
