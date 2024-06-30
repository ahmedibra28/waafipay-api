# Introduction to WaafiPay Payment Integration API

Welcome to the documentation for the WaafiPay Payment Integration API. This API provides a simplified integration solution for developers who want to incorporate WaafiPay's mobile payment services into their web applications. By using this API, developers can avoid the complexity of directly integrating with WaafiPay's API and instead interact with WaafiPay through this intermediary layer.

## Overview

WaafiPay is a mobile payment company that allows users to make secure and convenient payments using their mobile devices. Integrating WaafiPay's services into your web application can enhance the payment experience for your users and enable seamless transactions.

To simplify the integration process, we have created the WaafiPay Payment Integration API. This API acts as a bridge between your web application and WaafiPay, handling the necessary communication and processing on your behalf. By using this API, you can easily initiate payments and handle refunds without the need to directly interact with WaafiPay's extensive API documentation.

## Benefits of Using the Integration API

The WaafiPay Payment Integration API offers several advantages for developers:

1\. Simplified Integration: With this API, developers no longer need to navigate through the complexities of integrating directly with WaafiPay's API. The integration process is streamlined and made more accessible.

2\. Enhanced Efficiency: By utilizing the integration API, developers can save time and effort in understanding and implementing the intricacies of WaafiPay's API. The API abstracts away the technical details, allowing developers to focus on integrating payment functionality seamlessly.

3\. Consistent Integration Experience: The integration API provides a standardized interface for interacting with WaafiPay, ensuring a consistent experience across different web applications. Developers can rely on the API's endpoints and request structures, making it easier to integrate and maintain their applications.

## Base URL

The base URL for accessing the simplified WaafiPay Payment Integration API is:

```
https://waafipay.ahmedibra.com
```

## Initialize Payment

### Initialize Payment Request

To initiate a payment, make a POST request to the following endpoint:

```
{{baseURL}}/api/v1/payments/initialize
```

Include the following request payload:

```json
{
  "mobile": "770022200", // Mobile number of the customer making the payment
  "amount": 0.01, // Payment amount
  "customReference": "123", // Custom reference or identifier for the payment
  "description": "testing new approach of purchase", // Description or note for the payment
  "credentials": {
    "merchantUId": "************", // Your unique merchant ID provided by WaafiPay
    "apiUId": "************", // Your unique API user ID provided by WaafiPay
    "apiKey": "************", // Your API key provided by WaafiPay
    "accountNumberToWithdraw": "615301507" // Mobile number or account number for the owner of the web or e-commerce platform
  }
}
```

### Initialize Payment Response

Upon successfully initializing a payment, you will receive a response with the following details:

```json
{
  "id": "1c67b7e0-4290-4d1e-b58f-cfe839ee068d", // Payment transaction ID
  "timestamp": "2024-06-26 13:48:28.091", // Timestamp when the payment was initiated
  "transactionId": "40368106", // Transaction ID provided by WaafiPay
  "referenceId": "1c67b7e0-4290-4d1e-b58f-cfe839ee068d", // Reference ID for the payment transaction
  "amount": "0.01", // Payment amount
  "mobile": "615301507", // Mobile number of the customer making the payment
  "customReference": "123", // Custom reference or identifier for the payment
  "description": "testing new approach of purchase", // Description or note for the payment
  "message": "Payment has been done successfully" // Success message
}
```

## Refund Payment

### Refund Payment Request

To cancel a payment or issue a refund, make a POST request to the following endpoint:

```
{{baseURL}}/api/v1/payments/refund
```

Include the following request payload:

```json
{
  "transactionId": "40439443", // ID of the transaction to be canceled or refunded
  "reason": "testing new approach of refund", // Reason for canceling the payment or issuing a refund
  "customReference": "123456", // Custom reference or identifier for the refund
  "amount": 0.5, // Amount to be refunded
  "credentials": {
    "merchantUId": "************", // Your unique merchant ID provided by WaafiPay
    "apiUId": "************", // Your unique API user ID provided by WaafiPay
    "apiKey": "************", // Your API key provided by WaafiPay
    "accountNumberToWithdraw": "615301507" // Mobile number or account number for the owner of the web or e-commerce platform
  }
}
```

### Refund Payment Response

Upon successfully canceling a payment or issuing a refund, you will receive a response with the following details:

```json
{
  "id": "6745832e-55ab-4a5c-8991-c90f911f7129", // Refund transaction ID
  "timestamp": "2024-06-26 13:51:22.648", // Timestamp when the refund was processed
  "transactionId": "40368196", // Transaction ID of the canceled payment or refund
  "customReference": "123456", // Custom reference or identifier for the refund
  "description": "testing new approach of refund", // Description or note for the refund
  "message": "Refund has been done successfully" // Success message
}
```

## Conclusion

Congratulations! You have successfully integrated your web application with the WaafiPay Payment Integration API. This documentation provided you with an overview of the available endpoints, request structures, and response formats. Remember to handle authentication securely and follow best practices to ensure the safety of your users' payment information.

## Summary

The WaafiPay Payment Integration API simplifies the integration process for developers who want to incorporate WaafiPay's mobile payment services into their web applications. By utilizing this API, developers can avoid the complexities of directly integrating with WaafiPay's API and instead interact with WaafiPay through a streamlined and standardized interface.

Through the integration API, developers can initiate payments and handle refunds, providing a seamless payment experience for their users. This API offers simplicity, efficiency, and consistency, allowing developers to focus on integrating payment functionality without the need to delve into the intricacies of WaafiPay's API documentation.

We hope this documentation provides you with the necessary information to integrate the WaafiPay Payment Integration API into your web application successfully. Should you have any further questions or require assistance, please don't hesitate to reach out.

Note: The placeholders \***\*\*\*\*\*\*\*** represent values specific to your integration and should be replaced accordingly.
