#!/usr/bin/env node

/*
  SMARTy Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/
import {SmartyPayAPI} from './index';
import {Currency} from 'smartypay-client-model';

type StateType = 'unknown'
  | 'invoice-wait-data'
  | 'invoice-confirm'
  | 'invoice-call';

type InvoiceKey = 'amount'
  | 'token'
  | 'expiresAt'
  | 'publicKey'
  | 'secretKey'
  | 'metadata';


const NextLineInput = '\ncli: ';
const stdin = process.openStdin();
const {stdout} = process;



let state: StateType = 'unknown';
let invoiceReq: Record<InvoiceKey, string|undefined>;
let inProgress = false;


stdout.write('Welcome to SMARTy Pay CLI');
stdout.write("\nEnter 'help' for see all commands")
stdout.write(NextLineInput);


stdin.addListener("data", function(d) {

  // skip input
  if(inProgress)
    return;

  const input = d.toString().trim();

  if(state === 'unknown'){
    processUnknownState(input);
  }
  else if(state === 'invoice-wait-data'){
    processInvoiceReq(input);
  }
  else if(state === 'invoice-confirm'){
    processInvoiceConfirm(input);
  }
  else {
    stdout.write(`unknown input '${input}'. Try 'help' command`);
  }

  if( ! inProgress){
    stdout.write(NextLineInput);
  }

});


function processUnknownState(input: string){

  if(input === 'help'){
    printHelp();
    return;
  }

  if(input === 'exit'){
    stdout.write("\nGoodbye!");
    process.exit(0);
    return;
  }

  if(input === 'invoice') {

    state = 'invoice-wait-data';
    invoiceReq = {
      amount: undefined,
      token: undefined,
      expiresAt: undefined,
      publicKey: undefined,
      secretKey: undefined,
      metadata: undefined,
    }

    processInvoiceReq();
    return;
  }

  stdout.write(`unknown input '${input}'. Try 'help' command`);
}


function printHelp(){
  stdout.write("[Command list]");
  stdout.write("\n'help' - print current help message");
  stdout.write("\n'invoice' - create new invoice");
  stdout.write("\n'exit' - close cli");
}

function processInvoiceReq(input?: string){

  if(input){
    const curKey = findEmptyInvoiceKey();
    if(curKey){
      setInvoiceKey(curKey, input);
    }
  }

  const nextKey = findEmptyInvoiceKey();
  if( nextKey){
    stdout.write(`Enter value for '${nextKey}'...`);
  } else {
    state = 'invoice-confirm';
    stdout.write(`Create invoice with data\n${JSON.stringify(invoiceReq, null, 2)}\ny/n?`);
  }
}

function processInvoiceConfirm(input: string){
  const confirm = input.toLowerCase();
  if(confirm === 'y' || confirm === 'yes' || confirm === '1'){
    state = 'invoice-call';
    stdout.write('Invoice creating. Please wait...\n\n');
    createInvoice().catch(onError);
  } else {
    state = 'unknown';
    stdout.write('Operation canceled.\n\n');
    printHelp();
    return;
  }
}

async function createInvoice(){

  if(inProgress)
    return;

  inProgress = true;
  try {

    const cred = {
      secretKey: invoiceReq.secretKey!,
      publicKey: invoiceReq.publicKey!
    };

    const api = new SmartyPayAPI(cred);

    const result = await api.invoices.createInvoice({
      expiresAt: new Date(invoiceReq.expiresAt!),
      amount: invoiceReq.amount!,
      token: invoiceReq.token! as Currency,
      metadata: invoiceReq.metadata,
    });

    state = 'unknown';

    console.log('Invoice', result);
    console.log('');
  }
  catch (e){

    state = 'unknown';

    console.log('Cannot create invoice:', e.message, e.body);
    console.log('');
    printHelp();

  } finally {
    inProgress = false;
    stdout.write(NextLineInput);
  }
}

function onError(e: any){
  console.log('Got error', e);
}


function findEmptyInvoiceKey(): InvoiceKey | undefined {
  return Object.keys(invoiceReq)
    .find(key => invoiceReq[key as InvoiceKey] == undefined) as any;
}

function setInvoiceKey(key: InvoiceKey, value: string){
  invoiceReq[key] = value;
}


