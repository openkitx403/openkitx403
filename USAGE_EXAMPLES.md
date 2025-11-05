# OpenKitx403 - Complete Usage Examples

This document provides production-ready examples for all supported use cases.

## Table of Contents
1. [TypeScript Client (Browser)](#1-typescript-client-browser)
2. [TypeScript Client (Node.js)](#2-typescript-client-nodejs)
3. [TypeScript Server (Express)](#3-typescript-server-express)
4. [TypeScript Server (Fastify)](#4-typescript-server-fastify)
5. [Python Server (FastAPI)](#5-python-server-fastapi)
6. [Python Client](#6-python-client)
7. [LangChain Integration](#7-langchain-integration)
8. [AI Agent Integration](#8-ai-agent-integration)

---

## 1. TypeScript Client (Browser)

### Installation
```bash
npm install @openkitx403/client
```

### Basic Usage
```typescript
import { OpenKit403Client } from '@openkitx403/client';

// Initialize client
const client = new OpenKit403Client();

// Connect to wallet (Phantom, Backpack, or Solflare)
async function authenticateUser() {
  try {
    // Connect wallet
    await client.connect('phantom');
    console.log('Wallet connected!');
    
    // Authenticate with protected API
    const result = await client.authenticate({
      resource: 'https://api.example.com/protected',
      method: 'GET'
    });
    
    if (result.ok) {
      console.log('✅ Authenticated as:', result.address);
      console.log('Response:', await result.response?.json());
    } else {
      console.error('❌ Authentication failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run authentication
authenticateUser();
```

### React Example
```typescript
import { useState, useEffect } from 'react';
import { OpenKit403Client, detectWallets } from '@openkitx403/client';

function App() {
  const [client] = useState(() => new OpenKit403Client());
  const [wallets, setWallets] = useState<string[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Detect available wallets
    detectWallets().then(setWallets);
  }, []);

  const authenticate = async (wallet: string) => {
    setLoading(true);
    try {
      await client.connect(wallet as any);
      
      const result = await client.authenticate({
        resource: 'https://api.example.com/user/profile',
        method: 'GET'
      });
      
      if (result.ok) {
        setAddress(result.address!);
        alert('✅ Authenticated successfully!');
      } else {
        alert('❌ Failed: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>OpenKitx403 Demo</h1>
      
      {address ? (
        <div>
          <p>✅ Connected as: {address}</p>
        </div>
      ) : (
        <div>
          <h2>Connect Wallet:</h2>
          {wallets.map(wallet => (
            <button 
              key={wallet} 
              onClick={() => authenticate(wallet)}
              disabled={loading}
            >
              {loading ? 'Connecting...' : `Connect ${wallet}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
```

### POST Request with Body
```typescript
const client = new OpenKit403Client();
await client.connect('phantom');

const result = await client.authenticate({
  resource: 'https://api.example.com/create-nft',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    name: 'My NFT',
    description: 'Cool NFT'
  }
});

if (result.ok) {
  const data = await result.response?.json();
  console.log('NFT created:', data);
}
```

---

## 2. TypeScript Client (Node.js)

### Installation
```bash
npm install @openkitx403/client @solana/web3.js
```

### Using with Keypair
```typescript
import { OpenKit403Client } from '@openkitx403/client';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// For Node.js, you need to manually sign
// (wallets are browser-only)

async function nodeAuthenticate() {
  // Load your keypair
  const keypair = Keypair.fromSecretKey(
    bs58.decode('YOUR_SECRET_KEY_BASE58')
  );
  
  // Step 1: Get challenge
  const response1 = await fetch('https://api.example.com/protected');
  
  if (response1.status === 403) {
    const wwwAuth = response1.headers.get('WWW-Authenticate');
    const match = wwwAuth?.match(/challenge="([^"]+)"/);
    const challengeB64 = match![1];
    
    // Step 2: Sign challenge
    const challengeJson = Buffer.from(
      challengeB64.replace(/-/g, '+').replace(/_/g, '/') + '==',
      'base64'
    ).toString();
    
    const challenge = JSON.parse(challengeJson);
    const signingString = buildSigningString(challenge);
    const message = Buffer.from(signingString);
    
    const signature = nacl.sign.detached(message, keypair.secretKey);
    const signatureB58 = bs58.encode(signature);
    
    // Step 3: Retry with Authorization
    const nonce = crypto.randomBytes(16).toString('base64url');
    const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    const authHeader = `OpenKitx403 addr="${keypair.publicKey.toBase58()}", sig="${signatureB58}", challenge="${challengeB64}", ts="${ts}", nonce="${nonce}", bind="GET:/protected"`;
    
    const response2 = await fetch('https://api.example.com/protected', {
      headers: {
        'Authorization': authHeader
      }
    });
    
    console.log('✅ Authenticated:', response2.status);
    console.log(await response2.json());
  }
}

function buildSigningString(challenge: any): string {
  return [
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
  ].join('\n');
}

nodeAuthenticate();
```

---

## 3. TypeScript Server (Express)

### Installation
```bash
npm install @openkitx403/server express
```

### Basic Express Setup
```typescript
import express from 'express';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const app = express();

// Configure OpenKit403
const openkit = createOpenKit403({
  issuer: 'my-api-v1',
  audience: 'https://api.example.com',
  ttlSeconds: 60,
  bindMethodPath: true,
  originBinding: true,
  replayStore: inMemoryLRU()
});

// Apply middleware to all routes
app.use(openkit.middleware());

// Protected route
app.get('/protected', (req, res) => {
  const user = (req as any).openkitx403User;
  
  res.json({
    message: 'Success!',
    wallet: user.address,
    timestamp: new Date().toISOString()
  });
});

// Optionally: unprotected routes before middleware
app.get('/public', (req, res) => {
  res.json({ message: 'Public endpoint' });
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
```

### Selective Route Protection
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

// Public routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes
const protectedRouter = express.Router();
protectedRouter.use(openkit.middleware());

protectedRouter.get('/user/profile', (req, res) => {
  const user = (req as any).openkitx403User;
  res.json({
    address: user.address,
    profile: { /* user data */ }
  });
});

protectedRouter.post('/user/update', express.json(), (req, res) => {
  const user = (req as any).openkitx403User;
  // Update user data
  res.json({ success: true, address: user.address });
});

app.use('/api', protectedRouter);

app.listen(3000);
```

### With Token Gating
```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const connection = new Connection('https://api.mainnet-beta.solana.com');

const openkit = createOpenKit403({
  issuer: 'my-api-v1',
  audience: 'https://api.example.com',
  ttlSeconds: 60,
  replayStore: inMemoryLRU(),
  
  // Token gate: require holding specific NFT or token
  tokenGate: async (address: string) => {
    try {
      const pubkey = new PublicKey(address);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubkey,
        { mint: new PublicKey('YOUR_TOKEN_MINT') }
      );
      
      // Check if user holds at least 1 token
      return tokenAccounts.value.length > 0;
    } catch (error) {
      console.error('Token gate check failed:', error);
      return false;
    }
  }
});

app.use(openkit.middleware());
```

---

## 4. TypeScript Server (Fastify)

### Installation
```bash
npm install @openkitx403/server fastify
```

### Basic Fastify Setup
```typescript
import Fastify from 'fastify';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const fastify = Fastify({ logger: true });

const openkit = createOpenKit403({
  issuer: 'my-api-v1',
  audience: 'https://api.example.com',
  ttlSeconds: 60,
  bindMethodPath: true,
  replayStore: inMemoryLRU()
});

// Use as onRequest hook
fastify.addHook('onRequest', async (request, reply) => {
  const hook = openkit.fastifyHook();
  
  const result = await hook(request, reply);
  if (result) {
    // Hook returned error response
    return reply.send(result);
  }
});

// Protected route
fastify.get('/protected', async (request, reply) => {
  const user = (request as any).openkitx403User;
  
  return {
    message: 'Success!',
    wallet: user.address
  };
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('🚀 Fastify server running');
});
```

---

## 5. Python Server (FastAPI)

### Installation
```bash
pip install openkitx403
# or
poetry add openkitx403
```

### Basic FastAPI Setup
```python
from fastapi import FastAPI, Depends
from openkitx403 import OpenKit403Middleware, require_openkitx403_user, OpenKit403User

app = FastAPI()

# Add middleware
app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    ttl_seconds=60,
    bind_method_path=True,
    origin_binding=True,
    replay_backend="memory"
)

@app.get("/")
async def root():
    return {"message": "Public endpoint"}

@app.get("/protected")
async def protected(user: OpenKit403User = Depends(require_openkitx403_user)):
    """Protected endpoint requiring wallet authentication"""
    return {
        "message": f"Hello, {user.address}!",
        "wallet": user.address,
        "challenge": user.challenge
    }

@app.post("/create-item")
async def create_item(
    item: dict,
    user: OpenKit403User = Depends(require_openkitx403_user)
):
    """Protected POST endpoint"""
    return {
        "created_by": user.address,
        "item": item
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### With Token Gating
```python
from fastapi import FastAPI
from openkitx403 import OpenKit403Middleware
from solana.rpc.api import Client
from solana.publickey import PublicKey

solana_client = Client("https://api.mainnet-beta.solana.com")

async def check_token_holdings(address: str) -> bool:
    """Check if wallet holds required tokens"""
    try:
        pubkey = PublicKey(address)
        
        # Check token balance
        response = solana_client.get_token_accounts_by_owner(
            pubkey,
            {"mint": PublicKey("YOUR_TOKEN_MINT")}
        )
        
        return len(response.value) > 0
    except Exception as e:
        print(f"Token gate error: {e}")
        return False

app = FastAPI()

app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    ttl_seconds=60,
    token_gate=check_token_holdings  # Add token gating
)
```

### Excluding Paths from Authentication
```python
app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    excluded_paths=["/health", "/public", "/docs"]  # No auth required
)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/protected")
async def protected(user: OpenKit403User = Depends(require_openkitx403_user)):
    return {"wallet": user.address}
```

---

## 6. Python Client

### Basic Usage
```python
import requests
from solana.keypair import Keypair
import base58
import json
import secrets
from datetime import datetime

def authenticate_with_api(api_url: str, keypair: Keypair):
    """Authenticate with OpenKit403 API using Solana keypair"""
    
    # Step 1: Get challenge
    response1 = requests.get(api_url)
    
    if response1.status_code == 403:
        www_auth = response1.headers.get('WWW-Authenticate', '')
        
        # Extract challenge
        import re
        match = re.search(r'challenge="([^"]+)"', www_auth)
        if not match:
            raise ValueError("No challenge found")
        
        challenge_b64 = match.group(1)
        
        # Decode challenge
        from openkitx403 import base64url_decode, build_signing_string
        challenge_json = base64url_decode(challenge_b64)
        challenge = json.loads(challenge_json)
        
        # Build signing string
        signing_string = build_signing_string(challenge)
        
        # Sign with keypair
        from nacl.signing import SigningKey
        signing_key = SigningKey(keypair.secret_key[:32])
        signature = signing_key.sign(signing_string.encode()).signature
        signature_b58 = base58.b58encode(signature).decode()
        
        # Build Authorization header
        nonce = base58.b58encode(secrets.token_bytes(16)).decode()
        ts = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        bind = f"GET:{requests.utils.urlparse(api_url).path}"
        
        auth_header = (
            f'OpenKitx403 '
            f'addr="{keypair.public_key}", '
            f'sig="{signature_b58}", '
            f'challenge="{challenge_b64}", '
            f'ts="{ts}", '
            f'nonce="{nonce}", '
            f'bind="{bind}"'
        )
        
        # Step 2: Retry with auth
        response2 = requests.get(
            api_url,
            headers={'Authorization': auth_header}
        )
        
        if response2.status_code == 200:
            print("✅ Authenticated successfully!")
            print(response2.json())
        else:
            print(f"❌ Authentication failed: {response2.status_code}")
            print(response2.text)
    else:
        print(f"Unexpected response: {response1.status_code}")

# Usage
keypair = Keypair.from_secret_key(base58.b58decode("YOUR_SECRET_KEY"))
authenticate_with_api("https://api.example.com/protected", keypair)
```

---

## 7. LangChain Integration

### Installation
```bash
npm install @openkitx403/client langchain
```

### LangChain Tool
```typescript
import { OpenKit403Client } from '@openkitx403/client';
import { Tool } from 'langchain/tools';

export class SolanaWalletAuthTool extends Tool {
  name = "solana_wallet_auth";
  description = "Authenticate with Solana wallet to access protected APIs. Use this when you need to make authenticated requests to blockchain-gated services.";
  
  private client: OpenKit403Client;
  
  constructor() {
    super();
    this.client = new OpenKit403Client();
  }
  
  async _call(input: string): Promise<string> {
    try {
      // Parse input: "wallet=phantom,url=https://api.example.com/data"
      const params = Object.fromEntries(
        input.split(',').map(p => p.split('='))
      );
      
      await this.client.connect(params.wallet as any);
      
      const result = await this.client.authenticate({
        resource: params.url,
        method: params.method || 'GET'
      });
      
      if (result.ok) {
        const data = await result.response?.json();
        return JSON.stringify({
          success: true,
          address: result.address,
          data
        });
      } else {
        return JSON.stringify({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: String(error)
      });
    }
  }
}

// Usage with LangChain Agent
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from 'langchain/chat_models/openai';

async function runAgent() {
  const tools = [new SolanaWalletAuthTool()];
  
  const model = new ChatOpenAI({ temperature: 0 });
  
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });
  
  const result = await executor.call({
    input: "Connect my Phantom wallet and fetch my NFT collection from the API"
  });
  
  console.log(result.output);
}

runAgent();
```

---

## 8. AI Agent Integration

### Autonomous Agent Example
```typescript
import { OpenKit403Client } from '@openkitx403/client';

interface AgentTask {
  action: 'authenticate' | 'fetch' | 'post';
  url: string;
  wallet?: string;
  data?: any;
}

class WalletAuthAgent {
  private client: OpenKit403Client;
  private connectedWallet?: string;
  
  constructor() {
    this.client = new OpenKit403Client();
  }
  
  async executeTask(task: AgentTask): Promise<any> {
    // Auto-connect wallet if needed
    if (task.action === 'authenticate' || !this.connectedWallet) {
      await this.client.connect((task.wallet || 'phantom') as any);
      this.connectedWallet = task.wallet || 'phantom';
      console.log(`🔗 Connected to ${this.connectedWallet}`);
    }
    
    // Execute action
    switch (task.action) {
      case 'authenticate':
        return await this.authenticate(task.url);
      
      case 'fetch':
        return await this.fetchData(task.url);
      
      case 'post':
        return await this.postData(task.url, task.data);
      
      default:
        throw new Error(`Unknown action: ${task.action}`);
    }
  }
  
  private async authenticate(url: string) {
    const result = await this.client.authenticate({
      resource: url,
      method: 'GET'
    });
    
    return {
      success: result.ok,
      address: result.address,
      error: result.error
    };
  }
  
  private async fetchData(url: string) {
    const result = await this.client.authenticate({
      resource: url,
      method: 'GET'
    });
    
    if (result.ok) {
      const data = await result.response?.json();
      return { success: true, data };
    }
    
    return { success: false, error: result.error };
  }
  
  private async postData(url: string, data: any) {
    const result = await this.client.authenticate({
      resource: url,
      method: 'POST',
      body: data
    });
    
    if (result.ok) {
      const responseData = await result.response?.json();
      return { success: true, data: responseData };
    }
    
    return { success: false, error: result.error };
  }
}

// Usage
async function runAgentTasks() {
  const agent = new WalletAuthAgent();
  
  // Task 1: Authenticate
  const auth = await agent.executeTask({
    action: 'authenticate',
    url: 'https://api.example.com/auth',
    wallet: 'phantom'
  });
  
  console.log('Auth result:', auth);
  
  // Task 2: Fetch user data
  const userData = await agent.executeTask({
    action: 'fetch',
    url: 'https://api.example.com/user/profile'
  });
  
  console.log('User data:', userData);
  
  // Task 3: Create NFT
  const nft = await agent.executeTask({
    action: 'post',
    url: 'https://api.example.com/nfts',
    data: {
      name: 'My NFT',
      description: 'Created by AI agent'
    }
  });
  
  console.log('NFT created:', nft);
}

runAgentTasks();
```

### Python Agent Example
```python
from openkitx403 import create_challenge, verify_authorization
from solana.keypair import Keypair
import requests
import json

class SolanaAuthAgent:
    """AI Agent with Solana wallet authentication"""
    
    def __init__(self, keypair: Keypair, api_base: str):
        self.keypair = keypair
        self.api_base = api_base
        self.address = str(keypair.public_key)
    
    def execute(self, endpoint: str, method: str = "GET", data: dict = None):
        """Execute authenticated API call"""
        url = f"{self.api_base}{endpoint}"
        
        # Implementation similar to Python client example above
        # ...
        
        return {"success": True, "data": "..."}
    
    def autonomous_workflow(self):
        """Run autonomous task workflow"""
        
        # Task 1: Get user profile
        profile = self.execute("/user/profile", "GET")
        print(f"Profile: {profile}")
        
        # Task 2: Analyze and decide
        if profile.get("nft_count", 0) < 5:
            # Task 3: Create new NFT
            nft = self.execute("/nfts", "POST", {
                "name": "AI Generated NFT",
                "metadata": {"created_by": "agent"}
            })
            print(f"Created NFT: {nft}")
        
        return {"workflow": "complete"}

# Usage
keypair = Keypair.generate()
agent = SolanaAuthAgent(keypair, "https://api.example.com")
result = agent.autonomous_workflow()
```

---

## Complete End-to-End Example

### Frontend (React + TypeScript)
```typescript
// src/App.tsx
import { useState } from 'react';
import { OpenKit403Client } from '@openkitx403/client';

function App() {
  const [client] = useState(() => new OpenKit403Client());
  const [address, setAddress] = useState<string>();
  const [profile, setProfile] = useState<any>();

  const login = async () => {
    await client.connect('phantom');
    
    const result = await client.authenticate({
      resource: 'http://localhost:3000/api/profile',
      method: 'GET'
    });
    
    if (result.ok) {
      setAddress(result.address);
      const data = await result.response?.json();
      setProfile(data);
    }
  };

  return (
    <div>
      {!address ? (
        <button onClick={login}>Connect Wallet</button>
      ) : (
        <div>
          <p>Wallet: {address}</p>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### Backend (Express + TypeScript)
```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const app = express();
app.use(cors());

const openkit = createOpenKit403({
  issuer: 'my-app',
  audience: 'http://localhost:3000',
  ttlSeconds: 60,
  replayStore: inMemoryLRU()
});

app.use('/api', openkit.middleware());

app.get('/api/profile', (req, res) => {
  const user = (req as any).openkitx403User;
  res.json({
    address: user.address,
    profile: {
      openkitx403: `User_${user.address.slice(0, 6)}`,
      joinedAt: new Date().toISOString()
    }
  });
});

app.listen(3000, () => console.log('Server running on :3000'));
```

---

## Testing Examples

All examples can be tested with curl:

```bash
# Step 1: Get challenge
curl -i http://localhost:3000/protected

# Step 2: Sign challenge (use wallet or script)

# Step 3: Send with Authorization
curl -H 'Authorization: OpenKitx403 addr="...", sig="...", challenge="...", ts="...", nonce="..."' \
  http://localhost:3000/protected
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Enable replay protection** with `replayStore`
3. **Use method/path binding** for sensitive operations
4. **Set appropriate TTL** (60s recommended)
5. **Implement token gating** for exclusive access
6. **Monitor for suspicious patterns**
7. **Keep dependencies updated**

---

## Troubleshooting

### "Wallet not found"
- Ensure wallet extension is installed
- Check wallet is unlocked
- Try different wallet provider

### "Signature verification failed"
- Check message format matches exactly
- Verify key encoding (base58)
- Ensure wallet supports message signing

### "Challenge expired"
- Check server/client clock sync
- Increase `ttlSeconds` if needed
- Verify timezone handling (UTC)

---

For more examples and documentation, visit: https://github.com/openkitx403/openkitx403
