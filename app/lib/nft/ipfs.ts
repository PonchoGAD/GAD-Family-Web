export function ipfsToHttp(uri: string) {
  if (!uri) return uri;
  if (uri.startsWith('ipfs://')) {
    const gw = process.env.PINATA_GATEWAY || 'https://ipfs.io/ipfs/';
    return gw + uri.replace('ipfs://','');
  }
  return uri;
}
