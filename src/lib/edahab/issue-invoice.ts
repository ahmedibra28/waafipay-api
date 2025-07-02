// 0 => payment has been done successfully

import { EDahabIssueInvoiceProp, EDahabIssueInvoiceResponse } from '@/types'
import { enc } from 'crypto-js'
import sha256 from 'crypto-js/sha256'

export const eDahabPayIssueInvoice = async ({
  apiKey,
  edahabNumber,
  amount,
  agentCode,
  currency,
  secret,
}: EDahabIssueInvoiceProp): Promise<
  EDahabIssueInvoiceResponse & Error & { status: number }
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

    const data = await fetch(
      `https://edahab.net/api/api/issueinvoice?hash=${hash}`,
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
        message: data.statusText || 'Failed to make payment request',
        status: data.status,
      }

    const response: EDahabIssueInvoiceResponse & Error & { status: number } =
      await data.json()

    if (response.InvoiceStatus !== 'Paid' || response.StatusCode !== 0) {
      throw {
        message:
          response.ValidationErrors ||
          response.StatusDescription ||
          'Failed to make payment request',
        status: 500,
      }
    }

    return response
  } catch (error: any) {
    return error
  }
}
