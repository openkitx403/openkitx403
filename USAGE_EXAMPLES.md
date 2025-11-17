# OpenKitx403 – Complete Usage Examples

Production-ready examples for **all supported clients and frameworks**.
Integrate OpenKitx403 authentication in your web apps, APIs, and AI agents.

---

## Table of Contents

1. [Client (Browser)](#1-typescript-client-browser)  
2. [Client (Node.js)](#2-typescript-client-nodejs)  
3. [Server (Express)](#3-typescript-server-express)  
4. [Server (Fastify)](#4-typescript-server-fastify)  
5. [Python Server (FastAPI)](#5-python-server-fastapi)  
6. [Python Client](#6-python-client)  
7. [LangChain Integration](#7-langchain-integration)  
8. [AI Agent Integration](#8-ai-agent-integration)

---

## 1. TypeScript Client (Browser)

### Install
```
npm install @openkitx403/client
```

### Basic Authentication
```
import { OpenKit403Client } from '@openkitx403/client';

const client = new OpenKit403Client();

await client.connect('phantom'); // or backpack / solflare

const response = await client.authenticate({
    resource: 'https://api.example.com/protected'
});

if (response.ok) {
    const data = await response.json();
    console.log('✅ Authenticated as:', client.getAddress());
    console.log('Response:', data);
} else {
    console.error('❌ Authentication failed:', response.status);
}
```


### React Example
```
import { useState, useEffect } from 'react';
import { OpenKit403Client, detectWallets } from '@openkitx403/client';

function App() {
    const [client] = useState(() => new OpenKit403Client());
    const [wallets, setWallets] = useState<string[]>([]);
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {
    detectWallets().then(setWallets);
    }, []);

    const authenticate = async (wallet: string) => {
        await client.connect(wallet as any);
        const response = await client.authenticate({
            resource: 'https://api.example.com/user/profile'
        });


        if (response.ok) {
            const data = await response.json();
            setAddress(client.getAddress());
            alert('✅ Authenticated successfully!');
        } else {
            alert('❌ Failed: ' + response.status);
        }
    };

    return (
        <div>
            <h1>OpenKitx403 Demo</h1>
            {address ? (
                <p>✅ Connected as: {address}</p>
                ) : (
                wallets.map(wallet => (
                <button key={wallet} onClick={() => authenticate(wallet)}>
                    Connect {wallet}
                </button>
                ))
            )}
        </div>
    );
}

export default App;
```


### POST Request Example
```
await client.connect('phantom');

const response = await client.authenticate({
    resource: 'https://api.example.com/nfts',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'My NFT', description: 'Cool NFT' }
});

if (response.ok) {
    const data = await response.json();
    console.log('NFT created:', data);
}
```


---

## 2. TypeScript Client (Node.js)
```
npm install @openkitx403/client @solana/web3.js
```


Authenticate using a **Solana Keypair**:
```
import { OpenKit403Client } from '@openkitx403/client';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const keypair = Keypair.fromSecretKey(bs58.decode('YOUR_SECRET_KEY_BASE58'));
const client = new OpenKit403Client({ wallet: 'keypair' });

// Full authentication flow as before
```


---

## 3. TypeScript Server (Express)
```
npm install @openkitx403/server express
```


### Basic Express Setup
```
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
    const user = (req as any).openkitx403User;
    res.json({ wallet: user.address, message: 'Access granted' });
});

app.listen(3000, () => console.log('🚀 Server running on :3000'));
```


### Selective Route Protection
```
const router = express.Router();
router.use(openkit.middleware());

router.get('/user/profile', (req, res) => { 
    res.json({ wallet: (req as any).openkitx403User.address });
});

app.use('/api', router);
```


### Token Gating Example
```
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

const openkit = createOpenKit403({
    issuer: 'my-api',
    audience: 'https://api.example.com',
    replayStore: inMemoryLRU(),
    tokenGate: async (address: string) => {
        const pubkey = new PublicKey(address);
        const tokens = await connection.getParsedTokenAccountsByOwner(
            pubkey,
            { mint: new PublicKey('YOUR_TOKEN_MINT') }
        );
    return tokens.value.length > 0;
});

```

---

## 4. TypeScript Server (Fastify)
```
npm install fastify @openkitx403/server
```

```
import Fastify from 'fastify';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const fastify = Fastify();
const openkit = createOpenKit403({
    issuer: 'my-api',
    audience: 'https://api.example.com',
    replayStore: inMemoryLRU()
});

fastify.addHook('onRequest', openkit.fastifyHook());

fastify.get('/protected', async (req, reply) => {
    const user = (req as any).openkitx403User;
    return { wallet: user.address };
});

fastify.listen({ port: 3000 });
```


---

## 5. Python Server (FastAPI)
```
pip install openkitx403
```


### Basic Setup
```
from fastapi import FastAPI, Depends
from openkitx403 import OpenKit403Middleware, require_openkitx403_user

app = FastAPI()

app.add_middleware(
    OpenKit403Middleware,
    issuer="my-api",
    audience="https://api.example.com",
    replay_backend="memory",
)

@app.get("/protected")
async def protected(user=Depends(require_openkitx403_user)):
    return {"wallet": user.address}
```


### Token Gating
```
from solana.rpc.api import Client
from solana.publickey import PublicKey

solana = Client("https://api.mainnet-beta.solana.com")

async def check_token(address: str):
    pubkey = PublicKey(address)
    accounts = solana.get_token_accounts_by_owner(
        pubkey, {"mint": PublicKey("YOUR_TOKEN_MINT")}  
    )
    return len(accounts.value) > 0

app.add_middleware(
    OpenKit403Middleware,
    issuer="my-api",
    audience="https://api.example.com",
    token_gate=check_token
)
```


---

## 6. Python Client

Authenticate with Solana keypair (same challenge/response flow).
See detailed example above — kept intact for completeness.

---

## 7. LangChain Integration

Integrate OpenKitx403 wallet authentication into **LangChain Tools**:
```
import { Tool } from 'langchain/tools';
import { OpenKit403Client } from '@openkitx403/client';

export class SolanaWalletAuthTool extends Tool {
name = "solana_wallet_auth";
description = "Authenticate to blockchain-protected APIs using a Solana wallet.";

private client = new OpenKit403Client();

async _call(input: string) {
    const params = Object.fromEntries(input.split(',').map(p => p.split('=')));
    await this.client.connect(params.wallet as any);
    const result = await this.client.authenticate({ resource: params.url });
    return result.ok
        ? JSON.stringify({ success: true, address: result.address })
        : JSON.stringify({ success: false, error: result.error });
    }
}
```


---

## 8. AI Agent Integration

Autonomous agents can use OpenKitx403 for wallet-based authentication:
```
import { OpenKit403Client } from '@openkitx403/client';

class WalletAgent {
private client = new OpenKit403Client();

async authenticate(url: string, wallet = 'phantom') {
    await this.client.connect(wallet as any);
    const result = await this.client.authenticate({ resource: url });
    return result.ok
        ? { success: true, address: result.address }
        : { success: false, error: result.error };
    }
}
```


---

## End-to-End Example

Frontend (React) + Backend (Express) shown in the [Quick Start Guide](#). Clone the repo and run:
```
git clone https://github.com/openkitx403/openkitx403
cd openkitx403
npm install
npm run build
npm run dev

```

---

## Security Best Practices

✅ Use HTTPS in production  
✅ Enable replay protection (`replayStore`)  
✅ Use method/path binding for requests  
✅ Limit TTL to 60s  
✅ Implement token gating for access control  
✅ Monitor authentication logs  

---

## Troubleshooting

| Error                        | Solution                                      |
|------------------------------|-----------------------------------------------|
| **Wallet not found**          | Ensure wallet extension is installed and unlocked |
| **Signature verification failed** | Verify base58 encoding and message formatting     |
| **Challenge expired**         | Check clock sync between client/server; increase `ttlSeconds` |

---

**Docs:** [openkitx403.dev](https://openkitx403.github.io/openkitx403-docs/)  

**Issues:** [github.com/openkitx403/openkitx403/issues](https://github.com/openkitx403/openkitx403/issues)
