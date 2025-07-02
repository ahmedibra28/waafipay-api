# 🌍 Somalia Payment API — WaafiPay & eDahab

Modern and secure Cloudflare Worker API to process **mobile payments** using:

- ✅ **WaafiPay (EVC Plus)**
- ✅ **eDahab (Somtel)**

Built with [Hono.js](https://hono.dev) and designed to serve developers building fintech, top-up, or online services in Somalia 🇸🇴.

---

## 🚀 Features

- 📲 WaafiPay Purchase (with optional auto-withdraw)
- 💸 Withdraw directly to a mobile wallet
- ↩️ Refunds for completed WaafiPay transactions
- 🧾 eDahab Issue Invoice
- 💰 eDahab Credit Invoice (to customer or agent)

---

## 📦 Tech Stack

- **Cloudflare Workers** – Serverless, global edge platform
- **Hono.js** – Lightweight web framework
- **TypeScript** – Type-safe code
- **WaafiPay & eDahab APIs** – Local mobile money providers

---

## 📖 API Endpoints

All routes are prefixed with:

```
/api/v1
```

---

### 📲 POST `/payments/initialize`

Create a WaafiPay payment (optionally followed by a withdrawal).

#### ✅ Request

```json
{
  "mobile": "6xxxxxxxx",
  "amount": 10,
  "customReference": "ORDER001",
  "description": "Top-up payment",
  "credentials": {
    "merchantUId": "your-merchant-id",
    "apiUId": "your-api-user-id",
    "apiKey": "your-api-key",
    "accountNumberToWithdraw": "6xxxxxxxx"
  }
}
```

#### ✅ Success Response

```json
{
  "id": "REF-12345",
  "timestamp": "2025-07-01T12:00:00Z",
  "transactionId": "TX-456789",
  "referenceId": "REF-12345",
  "amount": "10.00",
  "charges": "0.2",
  "mobile": "6xxxxxxxx",
  "customReference": "ORDER001",
  "description": "Top-up payment",
  "message": "Payment has been done successfully",
  "withdraw": {
    "error": "Withdrawal failed" // if applicable
  }
}
```

---

### 💸 POST `/payments/withdraw`

Withdraw money to a mobile wallet via WaafiPay.

#### ✅ Request

```json
{
  "amount": 5,
  "description": "Withdraw to user",
  "credentials": {
    "merchantUId": "your-merchant-id",
    "apiUId": "your-api-user-id",
    "apiKey": "your-api-key",
    "accountNumberToWithdraw": "6xxxxxxxx"
  }
}
```

#### ✅ Response

```json
{
  "id": "WITHDRAW-67890",
  "timestamp": "2025-07-01T13:00:00Z",
  "transactionId": "TX-222333",
  "referenceId": "WITHDRAW-67890",
  "amount": "5.00",
  "description": "Withdraw to user",
  "message": "Withdrawal has been done successfully"
}
```

---

### ↩️ POST `/payments/refund`

Refund a previously completed WaafiPay transaction.

#### ✅ Request

```json
{
  "transactionId": "TX-456789",
  "amount": 10,
  "reason": "User canceled",
  "customReference": "ORDER001",
  "credentials": {
    "merchantUId": "your-merchant-id",
    "apiUId": "your-api-user-id",
    "apiKey": "your-api-key"
  }
}
```

#### ✅ Response

```json
{
  "id": "REFUND-78901",
  "timestamp": "2025-07-01T14:00:00Z",
  "transactionId": "TX-456789",
  "referenceId": "REFUND-78901",
  "customReference": "ORDER001",
  "description": "User canceled",
  "message": "Refund has been done successfully"
}
```

---

### 🧾 POST `/payments/issue-invoice`

Create an eDahab invoice for a mobile number.

#### ✅ Request

```json
{
  "mobile": "62xxxxxxxx",
  "amount": 20,
  "currency": "USD",
  "credentials": {
    "apiKey": "your-edahab-api-key",
    "secret": "your-secret",
    "agentCode": "AGENT123",
    "accountNumberToWithdraw": "62xxxxxxxx"
  }
}
```

#### ✅ Response

```json
{
  "invoiceId": "INV-12345",
  "transactionId": "ED-TX-98765",
  "message": "Payment has been done successfully",
  "withdraw": {
    "error": "Withdraw failed" // if applicable
  }
}
```

---

### 💰 POST `/payments/credit-invoice`

Withdraw or credit a specific invoice to a phone number via eDahab.

#### ✅ Request

```json
{
  "transactionId": "ED-TX-98765", // optional, will auto-generate
  "amount": 20,
  "currency": "USD",
  "credentials": {
    "apiKey": "your-api-key",
    "secret": "your-secret",
    "accountNumberToWithdraw": "62xxxxxxxx"
  }
}
```

#### ✅ Response

```json
{
  "transactionId": "ED-TX-98765",
  "message": "Withdrawal has been done successfully"
}
```

---

## ✅ Validation Rules

- Mobile numbers must be valid: Hormuud/Somnet for WaafiPay, Somtel for eDahab.
- Amount must be a number > 0
- Required credentials must be present
- Currency: `USD` or `SLSH` for eDahab

---

## 🛡 Error Responses

Standardized error response:

```json
{
  "status": "fail",
  "error": "Missing amount"
}
```

---

## 🧪 Local Development

1. Install dependencies:

```bash
npm install
```

2. Start dev server (with Wrangler):

```bash
npx wrangler dev src/index.ts
```

> Make sure your environment has proper `WAAFIPAY` credentials or mock setup.

---

## 🌍 Deployment (Cloudflare Workers)

Use Wrangler:

```bash
npx wrangler deploy --minify src/index.ts
```

Configure your `wrangler.toml`:

```toml
name = "waafipay-api"
compatibility_date = "2025-07-01"
main = "src/index.ts"
```

---

## 📧 Contact

Made by **[Ahmed Ibrahim](https://ahmedibra.com)** – Founder & Developer at [TopTayo](https://toptayo.com)

- Email: [info@ahmedibra.com](mailto:info@ahmedibra.com)

---
