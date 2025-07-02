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
    merchantCharges: string
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

export interface EDahabIssueInvoiceProp {
  apiKey: string
  secret: string
  edahabNumber: string
  amount: number
  agentCode: string
  currency: 'USD' | 'SLSH'
}

export interface EDahabCreditInvoiceProp {
  apiKey: string
  secret: string
  transactionAmount: number
  phoneNumber: string
  transactionId: string
  currency: 'USD' | 'SLSH'
}

export interface EDahabIssueInvoiceResponse {
  InvoiceStatus: 'Paid'
  TransactionId: string
  InvoiceId: string
  StatusCode: 0
  RequestId: number
  StatusDescription: string
  ValidationErrors: ?(string | null)
}

export interface EDahabCreditInvoiceResponse {
  TransactionStatus: 'Approved'
  TransactionMesage: string
  PhoneNumber: string
  TransactionId: string
}
