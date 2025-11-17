# OpenKitx403 — Quick Start Guide

Get up and running with **OpenKitx403** in 5 minutes.

---

## 1. Install

### Browser Client
```
npm install @openkitx403/client
```
### Node.js Server
```
npm install @openkitx403/server
```
### Python Server
```
pip install openkitx403
```
---

## 2. Server Setup

### Express (TypeScript)
```
import express from 'express';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';
const app = express();

const openkit = createOpenKit403({
    issuer: 'my-api',
    audience: 'https://api.example.com',
    replayStore: inMemoryLRU(),
});

app.use(openkit.middleware());

app.get('/protected', (req, res) => {
    res.json({ wallet: req.openkitx403User.address });
});

app.listen(3000, () => console.log('→ Server running at http://localhost:3000'));
```
### FastAPI (Python)
```
from fastapi import FastAPI, Depends
from openkitx403 import OpenKit403Middleware, require_openkitx403_user

app = FastAPI()

app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api",
    replay_backend="memory",
)

@app.get("/protected")
async def protected(user=Depends(require_openkitx403_user)):
    return {"wallet": user.address}
```
---

## 3. Client Setup

### Browser Example
```
import { OpenKit403Client } from '@openkitx403/client';

const client = new OpenKit403Client();

// Connect a Solana wallet (Phantom)
await client.connect('phantom');

// Authenticate against protected API
const response = await client.authenticate({
resource: 'https://api.example.com/protected',
});

if (response.ok) {
    const data = await response.json();
    console.log('✅ Authenticated:', data);
} else {
    console.error('❌ Authentication failed:', response.statusText);
}

await client.disconnect();
```
---

## 4. Run Example Project

Clone repository
```
git clone https://github.com/openkitx403/openkitx403
cd openkitx403

Install dependencies
npm install

Build all packages
npm run build

Run demo API
cd packages/examples/api-demo
npm run dev
```
---

## Next Steps

* 📘 Explore [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for detailed scenarios  
* 🔍 Review [docs/COMPLETE_SPECIFICATION.md](./docs/COMPLETE_SPECIFICATION.md) for protocol details  
* 🛡️ See [SECURITY.md](./SECURITY.md) for recommended best practices

---

## Need Help?

* **Docs:** [openkitx403.dev](https://openkitx403.github.io/openkitx403-docs/)  
* **Issues:** [GitHub Issues](https://github.com/openkitx403/openkitx403/issues)  


