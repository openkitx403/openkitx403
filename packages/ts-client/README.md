# @openkitx403/client

**Browser and Node.js client** for **OpenKitx403** — enabling wallet-based authentication for your dApps and APIs.
Supports **Phantom**, **Backpack**, **Solflare**, and **custom Solana keypairs**.

---

## 🚀 Installation

```bash
npm install @openkitx403/client
```

---

## ⚙️ Quick Usage (Browser)

```typescript
import { OpenKit403Client } from '@openkitx403/client';

const client = new OpenKit403Client();

// 1️⃣ Connect wallet
await client.connect('phantom');

// 2️⃣ Authenticate with your protected API
const response = await client.authenticate({
  resource: 'https://api.example.com/protected',
  method: 'GET',
});

if (response.ok) {
  const data = await response.json();
  console.log('✅ Authenticated');
  console.log('Wallet:', client.getAddress());
  console.log('Response:', data);
} else {
  console.error('❌ Authentication failed:', response.status);
}
```

---

## 🌐 React Example

```tsx
import { useState } from 'react';
import { OpenKit403Client } from '@openkitx403/client';

export default function App() {
  const [client] = useState(() => new OpenKit403Client());
  const [address, setAddress] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleLogin = async () => {
    try {
      await client.connect('phantom');
      const response = await client.authenticate({
        resource: 'https://api.example.com/user/profile',
      });

      if (response.ok) {
        setAddress(client.getAddress());
        setData(await response.json());
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }
}
```

---

## 🔍 Detect Available Wallets
```tsx
import { detectWallets } from '@openkitx403/client';

const wallets = await detectWallets();
console.log('Available wallets:', wallets);
// ['phantom', 'backpack']
```


---

## 🧩 API Reference

### `new OpenKit403Client(options?)`

Creates a new OpenKitx403 client instance.

**Options:**

| Option    | Type             | Description                         |
|-----------|------------------|-------------------------------------|
| `wallet?` | `WalletProvider` | Default wallet provider to use      |

**Example:**`
```tsx
const client = new OpenKit403Client({ wallet: 'phantom' });
```


---

### `client.connect(wallet: WalletProvider)`

Connects to the specified wallet provider.

**Parameters:**
- `wallet`: `'phantom' | 'backpack' | 'solflare'`

**Returns:** `Promise<void>`

**Throws:** Error if wallet not found or connection fails

---

### `client.authenticate(options)`

Signs and sends an authenticated request to a protected API.

**Parameters:**

| Option     | Type                     | Description                       |
|------------|--------------------------|-----------------------------------|
| `resource` | `string`                 | Target API endpoint (full URL)    |
| `method?`  | `string`                 | HTTP method (default: `'GET'`)    |
| `headers?` | `Record<string, string>` | Additional headers                |
| `body?`    | `any`                    | JSON payload (for POST/PUT)       |
| `wallet?`  | `WalletProvider`         | Auto-connect to wallet if needed  |

**Returns:** `Promise<Response>`

Returns standard Fetch API `Response` object.

**Example:**
```tsx
const client = new OpenKit403Client({ wallet: 'phantom' });
```
---

### `client.connect(wallet: WalletProvider)`

Connects to the specified wallet provider.

**Parameters:**
- `wallet`: `'phantom' | 'backpack' | 'solflare'`

**Returns:** `Promise<void>`

**Throws:** Error if wallet not found or connection fails

---

### `client.authenticate(options)`

Signs and sends an authenticated request to a protected API.

**Parameters:**

| Option     | Type                     | Description                       |
|------------|--------------------------|-----------------------------------|
| `resource` | `string`                 | Target API endpoint (full URL)    |
| `method?`  | `string`                 | HTTP method (default: `'GET'`)    |
| `headers?` | `Record<string, string>` | Additional headers                |
| `body?`    | `any`                    | JSON payload (for POST/PUT)       |
| `wallet?`  | `WalletProvider`         | Auto-connect to wallet if needed  |

**Returns:** `Promise<Response>`

Returns standard Fetch API `Response` object.

**Example:**
```tsx
const response = await client.authenticate({
  resource: 'https://api.example.com/data',
  method: 'POST',
  body: { message: 'Hello' }
});

if (response.ok) {
  const result = await response.json();
  console.log(result);
}
```


---

### `client.getAddress()`

Returns the currently connected wallet address.

**Returns:** `string` (base58-encoded public key)

---

### `client.disconnect()`

Disconnects the current wallet.

**Returns:** `void`

---

### `detectWallets()`

Detects available wallet providers in the browser.

**Returns:** `Promise<WalletProvider[]>`

---

## 📝 POST Request Example
```tsx
const client = new OpenKit403Client();
await client.connect('phantom');

const response = await client.authenticate({
  resource: 'https://api.example.com/submit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
  message: 'Hello from OpenKitx403'
  }
});

const data = await response.json();
console.log('Server response:', data);
```
---

## 🔄 Auto-Connect Example

If wallet isn't connected, you can pass wallet provider to `authenticate()`:
```tsx
const client = new OpenKit403Client();

// No need to call connect() first
const response = await client.authenticate({
  resource: 'https://api.example.com/protected',
  wallet: 'phantom' // Auto-connects if not already connected
});
```
---

## ⚠️ Error Handling
```tsx
const client = new OpenKit403Client();

try {
  await client.connect('phantom');

  const response = await client.authenticate({
  resource: 'https://api.example.com/protected' 
  });

  if (!response.ok) {
    console.error('Server error:', response.status);
  }
} catch (error) {
  if (error.message.includes('wallet not found')) {
    console.error('Please install Phantom wallet');
  } else {
    console.error('Authentication failed:', error);
  }
}


---

## 📚 Documentation

* [OpenKitx403 Protocol Specification](https://github.com/openkitx403/openkitx403)
* [Server SDK Documentation](https://github.com/openkitx403/openkitx403/tree/main/packages/server)
* [Security Best Practices](https://github.com/openkitx403/openkitx403/blob/main/SECURITY.md)

---

## 🛡️ Best Practices

* Always use **HTTPS** in production
* Handle wallet connection errors gracefully
* Use `response.ok` to check authentication success
* Keep challenge TTL short on server (60s recommended)
* For backend APIs, pair with `@openkitx403/server` middleware

---

## 🪪 License

[MIT](https://github.com/openkitx403/openkitx403/blob/main/LICENSE)


