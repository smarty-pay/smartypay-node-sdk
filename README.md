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
import {SmartyPayAPI} from 'smartypay-node-sdk';

async function createInvoice() {
  
  // call API 
  const api = new SmartyPayAPI({
    secretKey: 'YOUR_SECRET_KEY',
    publicKey: 'YOUR_API_KEY',
  });
  
  const invoice = await api.invoices.createInvoice({
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // after 1 hour from now
    amount: '1.99',
    token: 'bUSDT',
    metadata: 'YOUR_PURCHASE_ID' // optional
  });
  
  // result invoice id
  const invoiceId = invoice.id;
    
  // params to open invoice
  const params = new URLSearchParams();
  params.set('invoice-id', invoiceId);
    
  // additional params:
  // params.set('name', 'Item Name to Buy');
  // params.set('success-url', 'https://...');
  // params.set('fail-url', 'https://...');

  // final url be like "https://checkout.smartypay.io/invoice?invoice-id=XXXXXXX"
  const urlToRedirect = 'https://checkout.smartypay.io/invoice?' + params.toString();
}
```
- **expiresAt** - date before invoice is active
- **amount** - amount for invoice (example 0.99)
- **token** - see valid tokens here: https://docs.smartypay.io/general/supported-tokens
- **metadata** - optional field for any custom metadata (usually it's your own purchase id for success webhook)
- **secretKey** - you can get it here: https://dashboard.smartypay.io/
- **publicKey** - you can get it here: https://dashboard.smartypay.io/


### Create client's recharge address

[See docs](https://docs.smartypay.io/api/recharge-payments)

```typescript
import {SmartyPayAPI} from 'smartypay-node-sdk';

async function createRechargeAddress(customerId: string) {
  
  // call API
  const api = new SmartyPayAPI({
    secretKey: 'YOUR_SECRET_KEY',
    publicKey: 'YOUR_API_KEY',
  });
  
  const resp = await api.recharges.createRechargeAddress({
    token: 'bUSDT',
    customerId: customerId,
  });
  
  // recharge address for your customerId
  const rechargeAddress = resp.address;
}
```
- **token** - see valid tokens here: https://docs.smartypay.io/general/supported-tokens
- **customerId** - customer's id from your own system
- **secretKey** - you can get it here: https://dashboard.smartypay.io/
- **publicKey** - you can get it here: https://dashboard.smartypay.io/

### Check webhook signature

[See docs](https://docs.smartypay.io/api/webhooks)

```typescript
function isValidWebhook( resp: Respone){

  // See: https://docs.smartypay.io/api/webhooks
  const body: string = resp.body;
  const signature: string = resp.heades['x-api-digest'];
  
  return SmartyPayAPI.utils.isValidSignature(body,  signature, 'YOUR_SECRET_KEY');
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
