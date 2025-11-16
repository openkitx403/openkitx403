# @openkitx403/server

**Express & Fastify middleware** for **OpenKitx403** wallet authentication.
Easily protect your API routes with Solana wallet-based signatures.

---

## 🚀 Installation

```bash
npm install @openkitx403/server
```

---

## ⚙️ Quick Usage (Express)

```typescript
import express from 'express';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const app = express();

// Create OpenKitx403 instance
const openkit = createOpenKit403({
  issuer: 'my-api',
  audience: 'https://api.example.com',
  replayStore: inMemoryLRU(), // Prevent replay attacks
});

// Apply middleware
app.use(openkit.middleware());

// Protected route
app.get('/protected', (req, res) => {
  const user = (req as any).openkitx403User;
  res.json({ message: '✅ Authenticated', wallet: user.address });
});

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
```

---

## ⚡ Fastify Integration

```typescript
import Fastify from 'fastify';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const fastify = Fastify();

const openkit = createOpenKit403({
  issuer: 'my-api',
  audience: 'https://api.example.com',
  replayStore: inMemoryLRU(),
});

// Add authentication hook
fastify.addHook('onRequest', openkit.fastifyHook());

// Protected endpoint
fastify.get('/protected', async (req, reply) => {
  const user = (req as any).openkitx403User;
  return { message: '✅ Authenticated', wallet: user.address };
});

fastify.listen({ port: 3000 });
```


---

## 🔧 Configuration Options

| Option              | Type                                                 | Default | Description                                              |
|--------------------|------------------------------------------------------|---------|----------------------------------------------------------|
| `issuer`           | `string`                                             | required| Identifier for your API (e.g. `"my-api"`)                |
| `audience`         | `string`                                             | required| Expected audience or domain of your API                  |
| `ttlSeconds`       | `number`                                             | `60`    | Challenge time-to-live in seconds                        |
| `clockSkewSeconds` | `number`                                             | `120`   | Allowed clock drift for timestamp validation             |
| `bindMethodPath`   | `boolean`                                            | `false` | Require binding to HTTP method + path                    |
| `originBinding`    | `boolean`                                            | `false` | Require origin header validation                         |
| `uaBinding`        | `boolean`                                            | `false` | Require user-agent header validation                     |
| `replayStore`      | `ReplayStore`                                        | `null`  | Used to detect and block replayed requests               |
| `tokenGate`        | `(address: string) => Promise<boolean>`              | `null`  | Async check for wallet-based access (e.g. NFT ownership)|

---

## 🔄 Replay Protection

### In-Memory Store (Development)

```tsx
import { inMemoryLRU } from '@openkitx403/server';

const openkit = createOpenKit403({
  issuer: 'my-api',
  audience: 'https://api.example.com',
  replayStore: inMemoryLRU(10000) // Optional: max cache size (default 10000)
});
```

### Custom Replay Store (Production - Redis)

For distributed systems, implement a custom replay store:

```tsx
import { ReplayStore } from '@openkitx403/server';
import Redis from 'ioredis';

class RedisReplayStore implements ReplayStore {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  async check(key: string, ttlSeconds: number): Promise<boolean> {
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  async store(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, '1');
  }
}

// Usage
const redis = new Redis('redis://localhost:6379');
const openkit = createOpenKit403({
  issuer: 'my-api',
  audience: 'https://api.example.com',
  replayStore: new RedisReplayStore(redis)
});
```


---

## 🎫 Token Gating Example

Require users to hold specific NFTs or tokens:


```tsx
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

const openkit = createOpenKit403({
  issuer: 'my-api',
  audience: 'https://api.example.com',
  replayStore: inMemoryLRU(),
  tokenGate: async (address: string) => {
    try {
      const pubkey = new PublicKey(address);
      // Check if wallet holds specific NFT collection
      const nftAccounts = await connection.getTokenAccountsByOwner(
        pubkey,
        { mint: new PublicKey('YOUR_NFT_MINT_ADDRESS') }
      );
      return nftAccounts.value.length > 0;
    } catch (error) {
      console.error('Token gate check failed:', error);
      return false;
    }
  }});
```

---

## 🧩 Type Definitions

```tsx
interface OpenKit403Config {
  issuer: string;
  audience: string;
  ttlSeconds?: number;
  clockSkewSeconds?: number;
  bindMethodPath?: boolean;
  originBinding?: boolean;
  uaBinding?: boolean;
  replayStore?: ReplayStore;
  tokenGate?: (address: string) => Promise<boolean>;
}

interface OpenKit403User {
  address: string; // Solana wallet address (base58)
  challenge: Challenge; // Challenge payload
}

interface ReplayStore {
  check(key: string, ttlSeconds: number): Promise<boolean>;
  store(key: string, ttlSeconds: number): Promise<void>;
}```


---

## 📚 Documentation

* [OpenKitx403 Protocol Specification](https://github.com/openkitx403/openkitx403)
* [Client SDK Documentation](https://github.com/openkitx403/openkitx403/tree/main/packages/client)
* [Security Best Practices](https://github.com/openkitx403/openkitx403/blob/main/SECURITY.md)

---

## 🧠 Best Practices

* Always use **HTTPS** in production
* Enable **`replayStore`** for replay protection (required for production)
* Use **Redis-backed replay store** for multi-server deployments
* Use **`bindMethodPath: true`** for method-level signing security
* Apply **token gating** for NFT/token-gated endpoints
* Keep **TTL ≤ 60 seconds** for challenges
* Set **`clockSkewSeconds`** appropriately for your infrastructure (default 120s)

---

## 🪪 License

[MIT](../../LICENSE)
