# SMARTy Pay Node SDK
Simple library for creating invoices on backend side

## Build steps
### Clone repository into your dir
```shell
cd your_dir
git clone https://github.com/smarty-pay/smartypay-node-sdk
```

### Build
```shell
npm install
npm npm run build
```

### Usage 
```js
// make invoice
const invoice = await SmartyPayAPI.createInvoice({
  expiresAt: new Date(Date.now() + 1000 * 60 * 60), // after 1 hour from now
  amount: '1.99 bUSDT', // see valid tokens here: https://docs.smartypay.io/general/supported-tokens
}, {
  secretKey: 'YOUR_SECRET_KEY', // you can get it here: https://dashboard.smartypay.io/
  publicKey: 'YOUR_API_KEY', // you can get it here: https://dashboard.smartypay.io/
});
```


### Full docs
Checkout our TypeDocs: https://smarty-pay.github.io/smartypay-node-sdk/modules.html