export interface WaafiPayResponse {
  schemaVersion: string
  timestamp: string
  responseId: string
  responseCode: string
  errorCode: string
  responseMsg: string
  params?: {
    accountNo: string
    accountType: string
    state: string
    referenceId: string
    transactionId: string
    issuerTransactionId: string
    txAmount: string
    orderId: string
    description: string
  }
}

export interface WaafiPayProp {
  merchantUId: string
  apiUId: string
  apiKey: string
  referenceId: string
  transactionId?: number
  description: string
  amount: number
  mobile?: string
  accountNumberToWithdraw?: string | null
  business?: string
}
