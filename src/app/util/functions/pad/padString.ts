export function padString(n, length): string {
    n = n.toString();
    while (n.length < length) n = '0' + n;
    
    return n;
}