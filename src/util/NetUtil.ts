/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */
import https from 'https';
import http from 'http';
import {URLSearchParams} from 'url';

export interface CallProps {
  timeout?: number,
  headers?: Record<string, any>,
}

export async function post(
  url: string,
  data: Record<string, any> | string,
  {
    timeout,
    headers,
  }: CallProps): Promise<string> {

  const dataString = typeof data === 'string'? data : JSON.stringify(data);

  return request(
    'POST',
    url,
    dataString,
    {
      timeout,
      headers: {
        ...headers,
        'content-type': 'application/json',
      }
    }
  );
}


export async function get(
  url: string,
  queryParams: Record<string, any> | undefined,
  {
    timeout,
    headers,
  }: CallProps): Promise<string> {

  let callUrl = url;
  if(queryParams){

    const urlParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value])=>{
      urlParams.set(key, value.toString());
    });

    if(url.includes('?')){
      callUrl = `${callUrl}&${urlParams.toString()}`;
    } else {
      callUrl = `${callUrl}?${urlParams.toString()}`;
    }
  }

  return request(
    'GET',
    callUrl,
    undefined,
    {
      timeout,
      headers: {
        ...headers,
        'content-type': 'application/json',
      }
    }
  );
}



export async function request(
  method: string,
  url: string,
  reqBody: string|undefined,
  {
    timeout,
    headers,
  }: CallProps): Promise<string> {

  const sendHeaders = {
    ...(headers || {}),
  };

  if(reqBody){
    sendHeaders['content-length'] = reqBody.length;
  }

  const options = {
    method,
    headers: sendHeaders,
    timeout: timeout || 10_000, // in ms
  }

  return new Promise((resolve, reject) => {

    const isHttps = url.startsWith('https://');
    const api = isHttps? https : http;

    const req = api.request(url, options, (res) => {

      const statusCode = res.statusCode;

      const body: any[] = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {

        const resString = Buffer.concat(body).toString()

        if (statusCode && (statusCode < 200 || statusCode > 299)) {

          const error: any = new Error(`HTTP status code ${res.statusCode}`);
          error.body = resString;
          reject(error);

        } else {
          resolve(resString);
        }
      })
    });

    req.on('error', (err) => {
      reject(err);
    })

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request time out'));
    })

    if(reqBody) {
      req.write(reqBody);
    }

    req.end();
  })
}