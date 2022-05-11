# SMARTy Pay Node SDK
Simple library for creating invoices on backend side

## Installation
```shell
npm i smartypay-node-sdk
```

## Usage

### Create invoice

[See docs](https://docs.smartypay.io/general/authentication#signing-requests)

```typescript
async function createInvoice() {
  
  // call API 
  const invoice = await SmartyPayAPI.createInvoice({
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // after 1 hour from now
    amount: '1.99',
    token: 'bUSDT'
  }, {
    secretKey: 'YOUR_SECRET_KEY',
    publicKey: 'YOUR_API_KEY',
  });
  
  // result invoice id
  return invoice.id;
}
```
- **expiresAt** - date before invoice is active
- **amount** - amount for invoice (example 0.99)
- **token** - see valid tokens here: https://docs.smartypay.io/general/supported-tokens
- **secretKey** - you can get it here: https://dashboard.smartypay.io/
- **publicKey** - you can get it here: https://dashboard.smartypay.io/

### Check webhook signature

[See docs](https://docs.smartypay.io/api/webhooks)

```typescript
function isValidWebhook( resp: Respone){

  // See: https://docs.smartypay.io/api/webhooks
  const body: string = resp.body;
  const signature: string = resp.heades['x-api-digest'];
  
  return SmartyPayAPI.isValidSignature(body,  signature, 'YOUR_SECRET_KEY');
}
```

## Full API docs
Checkout our [TypeDocs](https://smarty-pay.github.io/smartypay-node-sdk/modules.html)

## Build steps
### Clone repository into your dir
```shell
cd your_dir
git clone https://github.com/smarty-pay/smartypay-node-sdk
```

### Build
```shell
npm install
npm run build
```
