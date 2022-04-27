/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */
import https from 'https';
import http from 'http';

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

  const dataString = typeof data === 'string'? data : JSON.stringify(data)

  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': dataString.length,
      ...(headers || {}),
    },
    timeout: timeout || 5000, // in ms
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
          resolve(resString)
        }
      })
    });

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request time out'))
    })

    req.write(dataString)
    req.end()
  })
}