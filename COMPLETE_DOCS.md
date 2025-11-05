# OpenKitx403 Complete Documentation

**Production-Ready HTTP-Native Wallet Authentication for Solana**

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Usage Examples](#usage-examples)
4. [API Reference](#api-reference)
5. [Protocol Specification](#protocol-specification)
6. [Security](#security)
7. [Deployment](#deployment)

---

## Quick Start

### 5-Minute Demo

**Terminal 1 - Start Server:**
```bash
cd packages/examples/api-demo
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Run Client:**
```bash
cd packages/examples/py-client-example
pip install -r requirements.txt
python example.py
```

**Browser - Web Demo:**
Open `packages/examples/web-demo/index.html`

---

## Installation

### TypeScript Client (Browser/Node)
```bash
npm install @openkitx403/client
```

### TypeScript Server (Express)
```bash
npm install @openkitx403/server
```

### Python Server (FastAPI)
```bash
pip install openkitx403
```

### Python Client
```bash
pip install openkitx403-client
```

### AI Agent Tools
```bash
npm install @openkitx403/agent
```

---

## Usage Examples

### 1. TypeScript Client (Browser)

```typescript
import { OpenKit403Client } from '@openkitx403/client';

// Initialize client
const client = new OpenKit403Client();

// Connect to Phantom wallet
await client.connect('phantom');

// Get connected address
const address = client.getConnectedAddress();
console.log(`Connected: ${address}`);

// Authenticate with protected API
const result = await client.authenticate({
  resource: 'https://api.example.com/protected',
  method: 'GET',
});

if (result.ok && result.response) {
  const data = await result.response.json();
  console.log('Success:', data);
  console.log('Wallet:', result.address);
} else {
  console.error('Failed:', result.error);
}

// Disconnect
await client.disconnect();
```

**Supported Wallets:**
- `'phantom'` - Phantom Wallet
- `'backpack'` - Backpack Wallet
- `'solflare'` - Solflare Wallet

### 2. TypeScript Server (Express)

```typescript
import express from 'express';
import cors from 'cors';
import { createOpenKit403, inMemoryReplayStore } from '@openkitx403/server';

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Create OpenKitx403 instance
const auth = createOpenKit403({
  issuer: 'my-api-v1',
  audience: 'https://api.example.com',
  ttlSeconds: 60,
  bindMethodPath: true,
  originBinding: true,
  replayStore: inMemoryReplayStore(),
  tokenGate: async (address) => {
    // Optional: Check if wallet meets requirements
    // e.g., holds specific tokens
    return true;
  },
});

// Public endpoint
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is public' });
});

// Protected endpoint - automatic auth
app.get('/api/protected', auth.middleware(), (req, res) => {
  const { address, challenge } = req.openkitx403;
  res.json({
    message: `Hello ${address}!`,
    timestamp: new Date().toISOString(),
  });
});

// Protected POST endpoint
app.post('/api/data', auth.middleware(), (req, res) => {
  const { address } = req.openkitx403;
  res.json({
    message: 'Data received',
    wallet: address,
    data: req.body,
  });
});

// Manual verification example
app.get('/api/manual', async (req, res) => {
  const result = await auth.verifyAuthorization(req);
  
  if (!result.ok) {
    const { headerValue } = auth.createChallenge(req);
    res.setHeader('WWW-Authenticate', headerValue);
    return res.status(403).json({ error: result.error });
  }
  
  res.json({ wallet: result.address });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### 3. Python Server (FastAPI)

```python
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from openkitx403 import (
    OpenKit403Middleware,
    require_openkitx403_user,
    get_openkitx403_user,
    create_openkitx403,
)

app = FastAPI(title="My Wallet-Protected API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add OpenKitx403 middleware
app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    ttl_seconds=60,
    bind_method_path=True,
    origin_binding=True,
    replay_backend="memory",
    # Optional: protect only specific paths
    # protected_paths=["/api/protected", "/api/admin"],
)

# Optional token gate
async def check_token_holder(address: str) -> bool:
    """Check if wallet holds required tokens"""
    # Implement your token-gating logic
    return True

# Alternative: manual middleware setup with token gate
# app.add_middleware(
#     OpenKit403Middleware,
#     audience="https://api.example.com",
#     token_gate=check_token_holder,
# )


@app.get("/")
async def root():
    return {"message": "API is running"}


@app.get("/api/public")
async def public_endpoint():
    return {"message": "This is public"}


@app.get("/api/protected")
async def protected_endpoint(user=Depends(require_openkitx403_user)):
    """Protected endpoint - requires wallet authentication"""
    return {
        "message": f"Hello {user.address}!",
        "wallet": user.address,
    }


@app.post("/api/data")
async def post_data(data: dict, user=Depends(require_openkitx403_user)):
    """Protected POST endpoint"""
    return {
        "message": "Data received",
        "wallet": user.address,
        "data": data,
    }


@app.get("/api/optional-auth")
async def optional_auth(user=Depends(get_openkitx403_user)):
    """Endpoint with optional authentication"""
    if user:
        return {"message": f"Authenticated as {user.address}"}
    return {"message": "Anonymous access"}


# Manual verification example
@app.get("/api/manual")
async def manual_verification(request: Request):
    """Manual verification without dependency"""
    auth = create_openkitx403(
        issuer="my-api-v1",
        audience="https://api.example.com",
    )
    
    result = await auth.verify_authorization(
        auth_header=request.headers.get("authorization"),
        method=request.method,
        path=request.url.path,
    )
    
    if not result.ok:
        from starlette.responses import JSONResponse
        header_value, _ = auth.create_challenge(
            method=request.method,
            path=request.url.path,
        )
        return JSONResponse(
            status_code=403,
            content={"error": result.error},
            headers={"WWW-Authenticate": header_value},
        )
    
    return {"wallet": result.address}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 4. Python Client

```python
import asyncio
from nacl.signing import SigningKey
import base58
from openkitx403_client import OpenKit403Client


async def main():
    # Generate or load signing key
    # In production, load from secure storage
    signing_key = SigningKey.generate()
    
    # Get public key (wallet address)
    public_key = base58.b58encode(bytes(signing_key.verify_key)).decode()
    print(f"Wallet address: {public_key}")
    
    # Create client
    async with OpenKit403Client(signing_key) as client:
        # GET request
        result = await client.authenticate(
            resource="https://api.example.com/protected",
            method="GET",
        )
        
        if result.ok and result.response:
            print("✓ Authentication successful!")
            data = await result.response.json()
            print(f"Response: {data}")
        else:
            print(f"✗ Authentication failed: {result.error}")
        
        # POST request
        result = await client.authenticate(
            resource="https://api.example.com/data",
            method="POST",
            headers={"Content-Type": "application/json"},
            body={"key": "value"},
        )
        
        if result.ok:
            data = await result.response.json()
            print(f"POST response: {data}")


if __name__ == "__main__":
    asyncio.run(main())
```

### 5. LangChain Agent

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { createOpenKit403Tool, OpenKit403Agent } from '@openkitx403/agent';

// Method 1: LangChain Tool
async function langchainExample() {
  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
  });
  
  // Create wallet auth tool
  const tool = createOpenKit403Tool('phantom');
  
  // Initialize agent
  const executor = await initializeAgentExecutorWithOptions(
    [tool],
    model,
    {
      agentType: 'openai-functions',
      verbose: true,
    }
  );
  
  // Run agent task
  const result = await executor.invoke({
    input: `Connect to my Phantom wallet and fetch my profile from 
    https://api.example.com/profile. Summarize what you find.`,
  });
  
  console.log(result.output);
}

// Method 2: Custom Agent
async function customAgentExample() {
  const agent = new OpenKit403Agent({
    wallet: 'phantom',
    autoConnect: true,
  });
  
  // Single task
  const result = await agent.execute({
    resource: 'https://api.example.com/protected',
  });
  
  if (result.success) {
    console.log('Data:', result.data);
  }
  
  // Multiple tasks in sequence
  const results = await agent.executeMany([
    { resource: 'https://api.example.com/profile' },
    { resource: 'https://api.example.com/settings' },
    {
      resource: 'https://api.example.com/data',
      method: 'POST',
      body: { key: 'value' },
    },
  ]);
  
  console.log('All results:', results);
}

// Run examples
langchainExample().catch(console.error);
```

---

## API Reference

### TypeScript Client

#### `OpenKit403Client`

**Constructor:**
```typescript
new OpenKit403Client(options?: { wallet?: WalletProvider })
```

**Methods:**
- `connect(wallet: WalletProvider): Promise<void>` - Connect to wallet
- `authenticate(options: AuthOptions): Promise<AuthResult>` - Authenticate request
- `signChallenge(challenge: string): Promise<{signature, address}>` - Sign challenge
- `getConnectedAddress(): string | null` - Get connected wallet address
- `disconnect(): Promise<void>` - Disconnect wallet

### TypeScript Server

#### `createOpenKit403(config: OpenKit403Config)`

**Config:**
```typescript
interface OpenKit403Config {
  issuer: string;              // Server identifier
  audience: string;            // Expected origin
  ttlSeconds?: number;         // Challenge TTL (default: 60)
  bindMethodPath?: boolean;    // Enable binding (default: true)
  originBinding?: boolean;     // Enable origin check (default: false)
  uaBinding?: boolean;         // Enable UA check (default: false)
  replayStore?: ReplayStore;   // Replay protection store
  tokenGate?: (address: string) => Promise<boolean>; // Token gating
  clockSkewSeconds?: number;   // Clock skew tolerance (default: 120)
}
```

**Methods:**
- `middleware()` - Express middleware
- `createChallenge(req)` - Generate challenge
- `verifyAuthorization(req)` - Verify authorization

### Python Server

#### `OpenKit403Middleware`

**Parameters:**
- `audience: str` - Expected origin (required)
- `issuer: str` - Server identifier (default: "api-v1")
- `ttl_seconds: int` - Challenge TTL (default: 60)
- `bind_method_path: bool` - Enable binding (default: True)
- `origin_binding: bool` - Enable origin check (default: False)
- `replay_backend: str` - Replay backend ("memory")
- `token_gate: Callable` - Token gating function
- `protected_paths: List[str]` - Protected path prefixes

#### `require_openkitx403_user`

FastAPI dependency that requires authentication.

#### `get_openkitx403_user`

FastAPI dependency that optionally gets user (returns None if not authenticated).

---

## Protocol Specification

See [docs/SPEC.md](docs/SPEC.md) for complete protocol specification including:
- HTTP flow
- Header formats
- Challenge structure
- Signature envelope
- Verification algorithm
- Security considerations

---

## Security

### Best Practices

1. **Always use HTTPS** in production
2. **Enable replay protection** with Redis/memory store
3. **Use short TTL** (60 seconds recommended)
4. **Enable method/path binding** for sensitive endpoints
5. **Implement rate limiting** at application level
6. **Validate wallet ownership** with token-gating if needed

### Security Model

**Protects Against:**
✓ Replay attacks (nonce + timestamp)  
✓ Cross-endpoint replay (method/path binding)  
✓ Cross-origin replay (origin binding)  
✓ Man-in-the-middle (HTTPS + signature verification)

**Does NOT Protect Against:**
✗ Compromised wallet private keys  
✗ Malicious browser extensions  
✗ Server-side vulnerabilities  
✗ Client-side XSS attacks

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

---

## Deployment

### Production Checklist

- [ ] HTTPS only
- [ ] Redis replay store (for high-traffic)
- [ ] Rate limiting
- [ ] Monitoring and alerts
- [ ] Proper CORS configuration
- [ ] Token-gating if needed
- [ ] Clock synchronization (NTP)
- [ ] Backup and recovery
- [ ] Documentation

### Docker Example

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

```bash
OPENKITX403_AUDIENCE=https://api.example.com
OPENKITX403_ISSUER=production-api
OPENKITX403_TTL_SECONDS=60
OPENKITX403_REDIS_URL=redis://localhost:6379
```

---

## Support

- **Documentation:** [docs/](docs/)
- **Examples:** [packages/examples/](packages/examples/)
- **Issues:** GitHub Issues
- **Security:** security@openkitx403.org

---

## License

MIT License - see [LICENSE](LICENSE)
