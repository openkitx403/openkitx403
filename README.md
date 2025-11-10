# OpenKitx403

**HTTP-native wallet authentication protocol for Solana.**

OpenKitx403 is an open-source, TypeScript-first protocol that standardizes HTTP 403 as the semantic "prove you control this wallet" challenge for Solana wallet authentication.

[![npm client](https://img.shields.io/npm/v/@openkitx403/client.svg)](https://www.npmjs.com/package/@openkitx403/client)
[![npm server](https://img.shields.io/npm/v/@openkitx403/server.svg)](https://www.npmjs.com/package/@openkitx403/server)
[![PyPI server](https://img.shields.io/pypi/v/openkitx403.svg)](https://pypi.org/project/openkitx403/)
[![PyPI client](https://img.shields.io/pypi/v/openkitx403-client.svg)](https://pypi.org/project/openkitx403-client/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

HTTP-native wallet authentication for Solana

## ✨ Features

- 🔐 **HTTP-native**: Uses standard HTTP 403 challenges
- 🌐 **Stateless**: No server-side sessions required
- 🔒 **Secure**: Ed25519 signature verification with replay protection
- 🚀 **Easy to use**: Drop-in middleware for Express, Fastify, and FastAPI
- 📦 **Production-ready**: Full TypeScript and Python SDKs
- 🤖 **AI-friendly**: LangChain integration and agent support
- 🎯 **Token-gating ready**: Built-in support for NFT/token requirements

## 📦 Installation

### TypeScript Client (Browser/Node)
```bash
npm install @openkitx403/client
```

### TypeScript Server (Express/Fastify)
```bash
npm install @openkitx403/server
```

### Python Server (FastAPI)
```bash
pip install openkitx403
# or
poetry add openkitx403
```

## 🚀 Quick Start

### Browser Client

```typescript
import { OpenKit403Client } from '@openkitx403/client';

const client = new OpenKit403Client();

// Connect wallet
await client.connect('phantom');

// Authenticate with API
const result = await client.authenticate({
  resource: 'https://api.example.com/protected',
  method: 'GET'
});

if (result.ok) {
  console.log('✅ Authenticated as:', result.address);
  const data = await result.response?.json();
}
```

### Express Server

```typescript
import express from 'express';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const app = express();

const openkit = createOpenKit403({
  issuer: 'my-api-v1',
  audience: 'https://api.example.com',
  ttlSeconds: 60,
  bindMethodPath: true,
  replayStore: inMemoryLRU()
});

app.use(openkit.middleware());

app.get('/protected', (req, res) => {
  const user = req.openkitx403User;
  res.json({ message: 'Hello!', wallet: user.address });
});

app.listen(3000);
```

### FastAPI Server

```python
from fastapi import FastAPI, Depends
from openkitx403 import OpenKit403Middleware, require_openkitx403_user

app = FastAPI()

app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    ttl_seconds=60,
    bind_method_path=True,
    replay_backend="memory"
)

@app.get("/protected")
async def protected(user = Depends(require_openkitx403_user)):
    return {"message": "Hello!", "wallet": user.address}
```

## 🎯 How It Works

1. **Client** requests a protected resource → **403 Forbidden**
2. **Server** responds with `WWW-Authenticate: OpenKitx403 ...` header containing a challenge
3. **Client** asks user's Solana wallet (Phantom/Backpack/Solflare) to sign the challenge
4. **Client** re-sends request with `Authorization: OpenKitx403 ...` header
5. **Server** verifies signature and grants access → **200 OK**

```
Client                          Server
  |                               |
  |  GET /protected              |
  |----------------------------->|
  |                               |
  |  403 + Challenge             |
  |<-----------------------------|
  |                               |
  |  [User signs with wallet]    |
  |                               |
  |  GET /protected + Auth       |
  |----------------------------->|
  |                               |
  |  200 OK + Data               |
  |<-----------------------------|
```

## 🔒 Security Features

- **Short-lived challenges** (60s default TTL)
- **Replay protection** via nonce store
- **Method/path binding** prevents cross-endpoint replay
- **Origin/User-Agent binding** (optional)
- **Clock skew tolerance** (±120s default)
- **Token-gating support** for NFT/SPL token requirements

## 📚 Documentation

- **[Complete Usage Examples](./USAGE_EXAMPLES.md)** - All use cases with code
- **[Protocol Specification](./docs/spec.md)** - RFC-style spec
- **[Internals Guide](./docs/internals.md)** - Implementation details
- **[Security Model](./SECURITY.md)** - Threat model and mitigations

## 🌐 Wallet Compatibility

| Wallet | Browser | Mobile | Status |
|--------|---------|--------|--------|
| Phantom | ✅ | ⚠️ Via WalletConnect | Supported |
| Backpack | ✅ | ❌ | Supported |
| Solflare | ✅ | ⚠️ Via WalletConnect | Supported |

## 🤖 AI Agent & LangChain Integration

OpenKitx403 supports autonomous agents and LangChain tools:

```typescript
import { SolanaWalletAuthTool } from '@openkitx403/langchain';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

const tools = [new SolanaWalletAuthTool()];
const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "zero-shot-react-description"
});

const result = await executor.call({
  input: "Connect my wallet and fetch my NFT collection"
});
```

See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md#7-langchain-integration) for complete examples.

## 📊 Package Structure

```
openkitx403/
├── packages/
│   ├── ts-client/         # Browser & Node.js SDK
│   ├── ts-server/         # Express & Fastify middleware
│   ├── py-server/         # FastAPI middleware
│   └── examples/          # Demo applications
├── docs/                  # Protocol specification
├── tests/                 # Test suites
└── USAGE_EXAMPLES.md      # Complete usage guide
```

## 🧪 Testing

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test
npm run test --workspace=packages/ts-client
npm run test --workspace=packages/ts-server

# Python tests
cd packages/py-server
pytest
```

## 🔧 Advanced Features

### Token Gating

```typescript
const openkit = createOpenKit403({
  issuer: 'my-api',
  audience: 'https://api.example.com',
  tokenGate: async (address: string) => {
    // Check if wallet holds required NFT/token
    const hasToken = await checkTokenHolding(address);
    return hasToken;
  }
});
```

### Custom Replay Store

```typescript
class RedisReplayStore implements ReplayStore {
  async check(key: string, ttl: number): Promise<boolean> {
    return await redis.exists(key);
  }
  
  async store(key: string, ttl: number): Promise<void> {
    await redis.setex(key, ttl, '1');
  }
}

const openkit = createOpenKit403({
  replayStore: new RedisReplayStore()
});
```

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 🙏 Acknowledgments

Inspired by the "HTTP-native + wallet + open" philosophy, OpenKitx403 is built from scratch with:
- Different header names and message format
- Enhanced security model
- Production-grade implementations
- Comprehensive documentation

## 🔗 Links

- **GitHub**: [https://github.com/openkitx403/openkitx403](https://github.com/openkitx403/openkitx403)
- **Documentation**: [https://openkitx403.github.io/openkitx403-docs/](https://openkitx403.github.io/openkitx403-docs/)
- **Twitter**: [https://x.com/openkitx403](https://x.com/openkitx403)

## 💬 Support

- 📧 Email: support@openkitx403.dev
- 🐛 Issues: [GitHub Issues](https://github.com/openkitx403/openkitx403/issues)

---

**Built with ❤️ for the Solana ecosystem**
