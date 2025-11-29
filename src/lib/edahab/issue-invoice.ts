// 0 => payment has been done successfully

import { EDahabIssueInvoiceProp, EDahabIssueInvoiceResponse } from '@/types'
import { enc } from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import axios from 'axios'

export const eDahabPayIssueInvoice = async ({
  apiKey,
  edahabNumber,
  amount,
  agentCode,
  currency,
  secret,
}: EDahabIssueInvoiceProp): Promise<
  EDahabIssueInvoiceResponse & { status?: number }
> => {
  try {
    const obj = {
      apiKey,
      edahabNumber,
      amount,
      agentCode,
      currency,
    }

    const hash = sha256(JSON.stringify(obj) + secret).toString(enc.Hex)

    const { data }: { data: EDahabIssueInvoiceResponse } = await axios.post(
      `https://edahab.net/api/api/issueinvoice?hash=${hash}`,
      obj,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (data.InvoiceStatus !== 'Paid' || data.StatusCode !== 0) {
      throw {
        message:
          data.ValidationErrors ||
          data.StatusDescription ||
          'Failed to make payment request',
        status: 500,
      }
    }

    return data
  } catch (error: any) {
    return {
      ...error?.response?.data,
      status: error?.response?.status || 500,
      message: error.message || 'Failed to make payment',
    }
  }
}
