# OpenKitx403 Documentation

**Production-grade HTTP-native Wallet Authentication for Solana**

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Usage Examples](#usage-examples)
4. [API Reference](#api-reference)
5. [Protocol Spec](#protocol-spec)
6. [Security](#security)
7. [Deployment](#deployment)

---

## Quick Start

### 5-Minute Demo

**Server**
```bash
cd packages/examples/api-demo
pip install -r requirements.txt
python main.py
````

**Client**

```bash
cd packages/examples/py-client-example
pip install -r requirements.txt
python example.py
```

**Browser**
Open `packages/examples/web-demo/index.html`

---

## Installation

### TypeScript (Client)

```bash
npm install @openkitx403/client
```

### TypeScript (Server)

```bash
npm install @openkitx403/server
```

### Python (Server)

```bash
pip install openkitx403
```

### Python (Client)

```bash
pip install openkitx403-client
```

### AI Agent Tools

```bash
npm install @openkitx403/agent
```

---

## Usage Examples

### TypeScript Client (Browser)

```typescript
import { OpenKit403Client } from '@openkitx403/client';

const client = new OpenKit403Client();
await client.connect('phantom');

const address = client.getConnectedAddress();
console.log(`Connected: ${address}`);

const result = await client.authenticate({
  resource: 'https://api.example.com/protected',
  method: 'GET',
});

if (result.ok && result.response) {
  const data = await result.response.json();
  console.log('Success:', data);
} else {
  console.error('Failed:', result.error);
}

await client.disconnect();
```

**Supported Wallets**

* `phantom`
* `backpack`
* `solflare`

---

### TypeScript Server (Express)

```typescript
import express from 'express';
import cors from 'cors';
import { createOpenKit403, inMemoryReplayStore } from '@openkitx403/server';

const app = express();
app.use(cors());
app.use(express.json());

const auth = createOpenKit403({
  issuer: 'api-v1',
  audience: 'https://api.example.com',
  ttlSeconds: 60,
  bindMethodPath: true,
  originBinding: true,
  replayStore: inMemoryReplayStore(),
  tokenGate: async () => true,
});

app.get('/api/public', (req, res) => res.json({ message: 'Public' }));

app.get('/api/protected', auth.middleware(), (req, res) => {
  const { address } = req.openkitx403;
  res.json({ message: `Hello ${address}`, time: new Date().toISOString() });
});

app.post('/api/data', auth.middleware(), (req, res) => {
  const { address } = req.openkitx403;
  res.json({ message: 'Data received', wallet: address, data: req.body });
});

app.get('/api/manual', async (req, res) => {
  const result = await auth.verifyAuthorization(req);
  if (!result.ok) {
    const { headerValue } = auth.createChallenge(req);
    res.setHeader('WWW-Authenticate', headerValue);
    return res.status(403).json({ error: result.error });
  }
  res.json({ wallet: result.address });
});

app.listen(3000, () => console.log('→ http://localhost:3000'));
```

---

### Python Server (FastAPI)

```python
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from openkitx403 import (
    OpenKit403Middleware,
    require_openkitx403_user,
    get_openkitx403_user,
    create_openkitx403,
)

app = FastAPI(title="Wallet-Protected API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="api-v1",
    ttl_seconds=60,
    bind_method_path=True,
    origin_binding=True,
    replay_backend="memory",
)

@app.get("/")
async def root():
    return {"message": "API running"}

@app.get("/api/public")
async def public():
    return {"message": "Public"}

@app.get("/api/protected")
async def protected(user=Depends(require_openkitx403_user)):
    return {"message": f"Hello {user.address}", "wallet": user.address}

@app.post("/api/data")
async def data(data: dict, user=Depends(require_openkitx403_user)):
    return {"wallet": user.address, "data": data}

@app.get("/api/optional-auth")
async def optional(user=Depends(get_openkitx403_user)):
    if user:
        return {"message": f"Authenticated as {user.address}"}
    return {"message": "Anonymous"}

@app.get("/api/manual")
async def manual(request: Request):
    auth = create_openkitx403(issuer="api-v1", audience="https://api.example.com")
    result = await auth.verify_authorization(
        auth_header=request.headers.get("authorization"),
        method=request.method,
        path=request.url.path,
    )
    if not result.ok:
        from starlette.responses import JSONResponse
        header_value, _ = auth.create_challenge(method=request.method, path=request.url.path)
        return JSONResponse(
            status_code=403,
            content={"error": result.error},
            headers={"WWW-Authenticate": header_value},
        )
    return {"wallet": result.address}
```

---

### Python Client

```python
import asyncio, base58
from nacl.signing import SigningKey
from openkitx403_client import OpenKit403Client

async def main():
    key = SigningKey.generate()
    address = base58.b58encode(bytes(key.verify_key)).decode()
    print(f"Wallet: {address}")

    async with OpenKit403Client(key) as client:
        res = await client.authenticate("https://api.example.com/protected", method="GET")
        if res.ok:
            print(await res.response.json())
        res = await client.authenticate(
            "https://api.example.com/data", method="POST", body={"key": "value"}
        )
        if res.ok:
            print(await res.response.json())

asyncio.run(main())
```

---

### LangChain Agent

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { createOpenKit403Tool, OpenKit403Agent } from '@openkitx403/agent';

// LangChain Tool
async function langchainExample() {
  const model = new ChatOpenAI({ modelName: 'gpt-4', temperature: 0 });
  const tool = createOpenKit403Tool('phantom');
  const executor = await initializeAgentExecutorWithOptions([tool], model, {
    agentType: 'openai-functions',
    verbose: true,
  });
  const result = await executor.invoke({
    input: 'Connect wallet and fetch profile from https://api.example.com/profile.',
  });
  console.log(result.output);
}

// Custom Agent
async function customAgentExample() {
  const agent = new OpenKit403Agent({ wallet: 'phantom', autoConnect: true });
  const result = await agent.execute({ resource: 'https://api.example.com/protected' });
  if (result.success) console.log(result.data);
}
```

---

## API Reference

### TypeScript Client

#### `OpenKit403Client`

```typescript
new OpenKit403Client(options?: { wallet?: WalletProvider })
```

**Methods**

* `connect(wallet)`
* `authenticate(options)`
* `signChallenge(challenge)`
* `getConnectedAddress()`
* `disconnect()`

---

### TypeScript Server

#### `createOpenKit403(config)`

```typescript
interface OpenKit403Config {
  issuer: string;
  audience: string;
  ttlSeconds?: number;
  bindMethodPath?: boolean;
  originBinding?: boolean;
  uaBinding?: boolean;
  replayStore?: ReplayStore;
  tokenGate?: (address: string) => Promise<boolean>;
  clockSkewSeconds?: number;
}
```

**Methods**

* `middleware()`
* `createChallenge(req)`
* `verifyAuthorization(req)`

---

### Python Server

#### `OpenKit403Middleware`

**Args**

* `audience` – required
* `issuer` – default `"api-v1"`
* `ttl_seconds` – default `60`
* `bind_method_path` – default `True`
* `origin_binding` – default `False`
* `replay_backend` – `"memory"`
* `token_gate` – callable
* `protected_paths` – optional list

**Deps**

* `require_openkitx403_user` – required auth
* `get_openkitx403_user` – optional auth

---

## Protocol Spec

Full details in [docs/SPEC.md](docs/SPEC.md):

* HTTP flow
* Headers
* Challenge format
* Signature schema
* Verification
* Security model

---

## Security

### Best Practices

1. Use **HTTPS** only
2. Enable **replay protection**
3. Set **TTL ≤ 60s**
4. Enable **method/path binding**
5. Apply **rate limiting**
6. Use **token gating** if required

### Model

**Protects**
✓ Replay attacks
✓ Cross-endpoint replay
✓ Origin spoofing
✓ MITM (via HTTPS + sig)

**Does Not Protect**
✗ Compromised wallets
✗ Malicious extensions
✗ Server/XSS exploits

See [SECURITY.md](SECURITY.md) for vulnerability policy.

---

## Deployment

### Checklist

* [ ] HTTPS only
* [ ] Redis replay store
* [ ] Rate limiting
* [ ] CORS config
* [ ] Token gating
* [ ] NTP sync
* [ ] Monitoring
* [ ] Backup docs

### Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Env Vars

```bash
OPENKITX403_AUDIENCE=https://api.example.com
OPENKITX403_ISSUER=production-api
OPENKITX403_TTL_SECONDS=60
OPENKITX403_REDIS_URL=redis://localhost:6379
```

---

## Support

* **Docs:** [docs/](docs/)
* **Examples:** [packages/examples/](packages/examples/)
* **Issues:** GitHub
* **Security:** [security@openkitx403.org](mailto:security@openkitx403.org)

---

## License

MIT © [LICENSE](LICENSE)

```
