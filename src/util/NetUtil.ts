/*
  Smarty Pay Node SDK
  @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
*/

import http from 'http';
import https from 'https';
import { URL, URLSearchParams } from 'url';

export interface CallProps {
  timeout?: number;
  headers?: Record<string, any>;
}

export async function post(
  url: string,
  data: Record<string, any> | string,
  { timeout, headers }: CallProps,
): Promise<string> {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);

  return request('POST', url, dataString, {
    timeout,
    headers: {
      ...headers,
      'content-type': 'application/json',
    },
  });
}

export async function get(
  url: string,
  queryParams: Record<string, any> | undefined,
  { timeout, headers }: CallProps,
): Promise<string> {
  let callUrl = url;
  if (queryParams) {
    const urlParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      urlParams.set(key, value.toString());
    });

    if (url.includes('?')) {
      callUrl = `${callUrl}&${urlParams.toString()}`;
    } else {
      callUrl = `${callUrl}?${urlParams.toString()}`;
    }
  }

  return request('GET', callUrl, undefined, {
    timeout,
    headers: {
      ...headers,
      'content-type': 'application/json',
    },
  });
}

export async function request(
  method: string,
  url: string,
  reqBody: string | undefined,
  { timeout, headers }: CallProps,
): Promise<string> {
  const sendHeaders: any = {
    'user-agent': 'smartypay-node-sdk',
    ...(headers ?? {}),
  };

  if (reqBody) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    sendHeaders['content-length'] = reqBody.length;
  }

  const uri = new URL(url);

  const options = {
    hostname: uri.hostname,
    port: uri.port,
    path: `${uri.pathname}${uri.search}`,
    protocol: uri.protocol,
    method,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    headers: sendHeaders,
    timeout: timeout ?? 10_000, // in ms
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { request } = uri.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    // using request(options) is more flexible than request(url, options)
    // for example: no errors in 'https-proxy-agent' lib
    const req = request(options, (res) => {
      const { statusCode } = res;

      const body: any[] = [];
      res.on('data', (chunk) => body.push(chunk));
      res.on('end', () => {
        const resString = Buffer.concat(body).toString();

        if (statusCode && (statusCode < 200 || statusCode > 299)) {
          const error: any = new Error(`HTTP status code ${res.statusCode}`);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          error.response = resString;

          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
            error.response = JSON.parse(resString);
          } catch (e) {
            // skip
          }

          reject(error);
        } else {
          resolve(resString);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request time out'));
    });

    if (reqBody) {
      req.write(reqBody);
    }

    req.end();
  });
}
