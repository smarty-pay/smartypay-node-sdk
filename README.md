# Smarty Pay Node SDK
Simple library for creating payments on backend side

## Installation
```shell
npm i smartypay-node-sdk
```

## Usage

### Create payment

[See docs](https://docs.smartypay.io/general/authentication#signing-requests)

```typescript
import { SmartyPayAPI } from 'smartypay-node-sdk';

async function createPayment() {
  
  // call API 
  const api = new SmartyPayAPI({
    secretKey: 'YOUR_SECRET_KEY',
    publicKey: 'YOUR_API_KEY',
  });
  
  const payment = await api.payments.createPayment({
    amount: {
      value: '1',
      currency: 'bUSDT',
    },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // optional: after 1 hour from now
    metadata: { orderId: 'YOUR_PURCHASE_ID' } // optional: any metadata
  });
  
  // result payment id
  const paymentId = payment.id;

  // additional params:
  const params = new URLSearchParams();
  // params.set('name', 'Item Name to Buy');
  // params.set('success-url', 'https://...');
  // params.set('fail-url', 'https://...');

  // final url be like "https://checkout.smartypay.io/XXXXXXX?..."
  const urlToRedirect = 'https://checkout.smartypay.io/' + paymentId + '?' + params.toString();
}
```
- **amount** - Amount for a payment (value and currency token). See valid tokens here: https://docs.smartypay.io/general/supported-tokens
- **expiresAt** - Optional: date before payment is active
- **metadata** - Optional: key-value for any custom metadata (usually it's your own purchase id for success webhook)

Api common config:
- **secretKey** - You can get it here: https://dashboard.smartypay.io/
- **publicKey** - You can get it here: https://dashboard.smartypay.io/


### Create client's recharge address

[See docs](https://docs.smartypay.io/api/recharge-payments)

```typescript
import { SmartyPayAPI } from 'smartypay-node-sdk';

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
- **token** - See valid tokens here: https://docs.smartypay.io/general/supported-tokens
- **customerId** - Customer's id from your own system

Api common config:
- **secretKey** - You can get it here: https://dashboard.smartypay.io/
- **publicKey** - You can get it here: https://dashboard.smartypay.io/

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
