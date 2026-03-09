export interface CryptoPrice {
  usd: number;
  ars: number;
  usd_24h_change: number;
}

export interface CryptoData {
  bitcoin: CryptoPrice;
  ethereum: CryptoPrice;
  monero: CryptoPrice;
  raptoreum: CryptoPrice;
}

export const CRYPTO_IDS = ['bitcoin', 'ethereum', 'monero', 'raptoreum'];
export const SYMBOLS: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  monero: 'XMR',
  raptoreum: 'RTM',
};

export const COLORS: Record<string, string> = {
  bitcoin: '#F7931A',
  ethereum: '#627EEA',
  monero: '#FF6600',
  raptoreum: '#9333ea',
};
