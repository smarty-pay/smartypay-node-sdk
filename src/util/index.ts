/**
 * SMARTy Pay Node SDK
 * @author Evgeny Dolganov <evgenij.dolganov@gmail.com>
 */

export function removeEnd(str: string, last: string): string {

  if ( ! str.endsWith(last))
    return str;

  return str.substring(0, str.length - last.length);
}