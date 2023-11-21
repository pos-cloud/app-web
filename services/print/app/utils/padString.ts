export function padString(n: any, length: number) {
    n = n.toString();
    while (n.length < length) n = '0' + n;

    return n;
  }