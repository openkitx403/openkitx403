import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

export type WalletProvider = 'phantom' | 'backpack' | 'solflare';

export interface AuthOptions {
  resource: string;
  method?: string;
  headers?: Record<string, string>;
  wallet?: WalletProvider;
  body?: any;
}

export interface AuthResult {
  ok: boolean;
  address?: string;
  challenge?: string;
  response?: Response;
  error?: string;
}

export interface Challenge {
  v: number;
  alg: string;
  nonce: string;
  ts: string;
  aud: string;
  method: string;
  path: string;
  uaBind: boolean;
  originBind: boolean;
  serverId: string;
  exp: string;
  ext?: Record<string, unknown>;
}

interface SolanaWallet {
  publicKey?: PublicKey;
  signMessage?(message: Uint8Array, display?: string): Promise<{ signature: Uint8Array }>;
  connect?(): Promise<{ publicKey: PublicKey }>;
  isConnected?: boolean;
}

declare global {
  interface Window {
    solana?: SolanaWallet;
    phantom?: { solana: SolanaWallet };
    backpack?: SolanaWallet;
    solflare?: SolanaWallet;
  }
}

function base64urlEncode(data: string | Buffer): string {
  const base64 = Buffer.isBuffer(data)
    ? data.toString('base64')
    : Buffer.from(data).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padding);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Node.js environment
    const crypto = require('crypto');
    crypto.randomFillSync(array);
  }
  return Buffer.from(array).toString('base64url');
}

function buildSigningString(challenge: Challenge): string {
  const lines = [
    'OpenKitx403 Challenge',
    '',
    `domain: ${challenge.aud}`,
    `server: ${challenge.serverId}`,
    `nonce: ${challenge.nonce}`,
    `ts: ${challenge.ts}`,
    `method: ${challenge.method}`,
    `path: ${challenge.path}`,
    '',
    `payload: ${JSON.stringify(challenge, Object.keys(challenge).sort())}`
  ];
  
  return lines.join('\n');
}

function parseWWWAuthenticate(header: string): { challenge: string } | null {
  const match = header.match(/challenge="([^"]+)"/);
  return match ? { challenge: match[1] } : null;
}

export class OpenKit403Client {
  private wallet?: WalletProvider;
  private walletInstance?: SolanaWallet;

  constructor(opts?: { wallet?: WalletProvider }) {
    this.wallet = opts?.wallet;
  }

  async connect(wallet?: WalletProvider): Promise<void> {
    const provider = wallet || this.wallet;
    if (!provider) {
      throw new Error('No wallet provider specified');
    }

    if (typeof window === 'undefined') {
      throw new Error('Wallet connection only available in browser');
    }

    let walletObj: SolanaWallet | undefined;

    switch (provider) {
      case 'phantom':
        walletObj = window.phantom?.solana || window.solana;
        break;
      case 'backpack':
        walletObj = window.backpack;
        break;
      case 'solflare':
        walletObj = window.solflare;
        break;
      default:
        throw new Error(`Unknown wallet provider: ${provider}`);
    }

    if (!walletObj) {
      throw new Error(`${provider} wallet not found. Please install it.`);
    }

    if (!walletObj.isConnected && walletObj.connect) {
      await walletObj.connect();
    }

    this.walletInstance = walletObj;
    this.wallet = provider;
  }

  async signChallenge(challengeB64: string): Promise<{ signature: string; address: string }> {
    if (!this.walletInstance) {
      throw new Error('Wallet not connected. Call connect() first.');
    }

    if (!this.walletInstance.publicKey) {
      throw new Error('Wallet public key not available');
    }

    const challengeJson = base64urlDecode(challengeB64);
    const challenge: Challenge = JSON.parse(challengeJson);
    const signingString = buildSigningString(challenge);
    const message = new TextEncoder().encode(signingString);

    if (!this.walletInstance.signMessage) {
      throw new Error('Wallet does not support message signing');
    }

    const { signature } = await this.walletInstance.signMessage(message, 'utf8');
    
    return {
      signature: bs58.encode(signature),
      address: this.walletInstance.publicKey.toBase58()
    };
  }

  async authenticate(options: AuthOptions): Promise<AuthResult> {
    const method = options.method || 'GET';
    const headers = { ...options.headers };

    // Make initial request
    const response1 = await fetch(options.resource, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    // If not 403 or no challenge, return as-is
    if (response1.status !== 403) {
      return {
        ok: response1.ok,
        response: response1,
        error: response1.ok ? undefined : `HTTP ${response1.status}`
      };
    }

    const wwwAuth = response1.headers.get('WWW-Authenticate');
    if (!wwwAuth || !wwwAuth.startsWith('OpenKitx403')) {
      return {
        ok: false,
        response: response1,
        error: 'No OpenKitx403 challenge found'
      };
    }

    const parsed = parseWWWAuthenticate(wwwAuth);
    if (!parsed) {
      return {
        ok: false,
        error: 'Failed to parse challenge'
      };
    }

    // Connect wallet if needed
    if (!this.walletInstance) {
      try {
        await this.connect(options.wallet);
      } catch (err) {
        return {
          ok: false,
          error: `Wallet connection failed: ${err}`
        };
      }
    }

    // Sign challenge
    let signed;
    try {
      signed = await this.signChallenge(parsed.challenge);
    } catch (err) {
      return {
        ok: false,
        error: `Signature failed: ${err}`
      };
    }

    // Build Authorization header
    const url = new URL(options.resource);
    const nonce = generateNonce();
    const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const bind = `${method}:${url.pathname}`;

    const authHeader = `OpenKitx403 addr="${signed.address}", sig="${signed.signature}", challenge="${parsed.challenge}", ts="${ts}", nonce="${nonce}", bind="${bind}"`;

    // Retry request with auth
    const response2 = await fetch(options.resource, {
      method,
      headers: {
        ...headers,
        'Authorization': authHeader
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    return {
      ok: response2.ok,
      address: signed.address,
      challenge: parsed.challenge,
      response: response2,
      error: response2.ok ? undefined : `Authentication failed: HTTP ${response2.status}`
    };
  }
}

// Standalone helper functions
export async function detectWallets(): Promise<WalletProvider[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  const wallets: WalletProvider[] = [];
  if (window.phantom?.solana || window.solana) wallets.push('phantom');
  if (window.backpack) wallets.push('backpack');
  if (window.solflare) wallets.push('solflare');
  
  return wallets;
}

export { base64urlEncode, base64urlDecode, buildSigningString };
