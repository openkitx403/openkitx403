# OpenKitx403 - Quick Start Guide

Get started with OpenKitx403 in 5 minutes!

## 1. Install Packages

### Client (Browser)
```bash
npm install @openkitx403/client
```

### Server (Node.js)
```bash
npm install @openkitx403/server
```

### Server (Python)
```bash
pip install openkitx403
```

## 2. Setup Server

### Express (TypeScript)
```typescript
import express from 'express';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const app = express();

const openkit = createOpenKit403({
  issuer: 'my-api',
  audience: 'https://api.example.com',
  replayStore: inMemoryLRU()
});

app.use(openkit.middleware());

app.get('/protected', (req, res) => {
  res.json({ wallet: req.openkitx403User.address });
});

app.listen(3000);
```

### FastAPI (Python)
```python
from fastapi import FastAPI, Depends
from openkitx403 import OpenKit403Middleware, require_openkitx403_user

app = FastAPI()

app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api",
    replay_backend="memory"
)

@app.get("/protected")
async def protected(user = Depends(require_openkitx403_user)):
    return {"wallet": user.address}
```

## 3. Setup Client

```typescript
import { OpenKit403Client } from '@openkitx403/client';

const client = new OpenKit403Client();

// Connect wallet
await client.connect('phantom');

// Authenticate
const result = await client.authenticate({
  resource: 'https://api.example.com/protected'
});

if (result.ok) {
  console.log('Success!', result.address);
}
```

## 4. Run Example

```bash
# Clone repo
git clone https://github.com/openkitx403/openkitx403
cd openkitx403

# Install dependencies
npm install

# Build packages
npm run build

# Run API demo
cd packages/examples/api-demo
npm run dev
```

## Next Steps

- Read [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for all use cases
- Check [docs/COMPLETE_SPECIFICATION.md](./docs/COMPLETE_SPECIFICATION.md) for protocol details
- Review [SECURITY.md](./SECURITY.md) for best practices

## Need Help?

- 📖 Documentation: https://openkitx403.dev
- 💬 Discord: https://discord.gg/openkitx403
- 🐛 Issues: https://github.com/openkitx403/openkitx403/issues
