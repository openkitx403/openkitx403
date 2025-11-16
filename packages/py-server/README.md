# openkitx403 — Python Server SDK

**FastAPI middleware** for **OpenKitx403** wallet-based authentication.
Add Solana wallet verification to any API endpoint with one line.

---

## 🚀 Installation

```bash
pip install openkitx403
# or
poetry add openkitx403
```

---

## ⚡ Quick Start

```python
from fastapi import FastAPI, Depends
from openkitx403 import OpenKit403Middleware, require_openkitx403_user

app = FastAPI(title="My Wallet-Protected API")

# Attach OpenKitx403 middleware
app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    ttl_seconds=60,
    bind_method_path=False, # Set True to bind challenges to specific paths
    origin_binding=False,
    replay_backend="memory"
)

@app.get("/protected")
async def protected(user = Depends(require_openkitx403_user)):
    """Example protected endpoint"""
    return {
        "message": f"Authenticated as {user.address}",
        "wallet": user.address
    }

@app.get("/public")
async def public():
    """Public endpoint - no authentication required"""
    return {"message": "Hello World"}

```

---

## 🔒 Optional Token Gating

```python
from openkitx403 import OpenKit403Middleware
from solana.rpc.api import Client
from solders.pubkey import Pubkey

solana_client = Client("https://api.mainnet-beta.solana.com")

async def check_token_holder(address: str) -> bool:
    """Example: verify wallet holds specific token"""
    try:
        pubkey = Pubkey.from_string(address)
        resp = solana_client.get_token_accounts_by_owner(
            pubkey,
            opts={"mint": str(Pubkey.from_string("YOUR_TOKEN_MINT"))}
        )
        return len(resp.value) > 0
    except Exception as e:
        print("Token check failed:", e)
        return False

app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    token_gate=check_token_holder,
)
```

---
## 🛤️ Exclude Paths from Authentication
```python
app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    excluded_paths=["/health", "/docs", "/openapi.json"]
)
```

---


---

## 🧩 API Reference

### `OpenKit403Middleware`

FastAPI middleware that adds OpenKitx403 authentication to your routes.

**Configuration Parameters:**

| Parameter            | Type                      | Default    | Description                                  |
|---------------------|---------------------------|------------|----------------------------------------------|
| `audience`          | `str`                     | required   | Expected API audience/origin                 |
| `issuer`            | `str`                     | required   | Server identifier                            |
| `ttl_seconds`       | `int`                     | `60`       | Challenge TTL in seconds                     |
| `clock_skew_seconds`| `int`                     | `120`      | Allowed clock skew for timestamp validation  |
| `bind_method_path`  | `bool`                    | `False`    | Bind challenge to specific HTTP method/path  |
| `origin_binding`    | `bool`                    | `False`    | Enable origin header validation              |
| `ua_binding`        | `bool`                    | `False`    | Enable user-agent header validation          |
| `replay_backend`    | `str`                     | `"memory"` | Replay protection backend                    |
| `token_gate`        | `Callable[[str], bool]`   | `None`     | Optional async function for wallet gating    |
| `excluded_paths`    | `list[str]`               | `None`     | Paths that bypass authentication             |

---

## 🔐 Token Gate Function Signature

Your token gate function must:
- Accept a single `address: str` parameter (base58-encoded public key)
- Return `bool` (True = allowed, False = denied)
- Can be async or sync

```python
async def my_token_gate(address: str) -> bool:
    # Your validation logic
    return True # or False
```

---

## 🎯 Accessing User Information

Use the `require_openkitx403_user` dependency to access authenticated user:

```python
from fastapi import Depends
from openkitx403 import require_openkitx403_user, OpenKit403User

@app.get("/profile")
async def profile(user: OpenKit403User = Depends(require_openkitx403_user)):
    return {
        "address": user.address,
        "challenge": user.challenge # Original challenge object
    }
```
---

## 🔧 Custom Replay Store

By default, middleware uses in-memory replay protection. For production with multiple servers:

```python
from openkitx403 import ReplayStore

class RedisReplayStore:
"""Example Redis-based replay store"""
    def __init__(self, redis_client):
        self.redis = redis_client

    async def check(self, key: str, ttl_seconds: int) -> bool:
        return await self.redis.exists(key)

    async def store(self, key: str, ttl_seconds: int) -> None:
        await self.redis.setex(key, ttl_seconds, "1")

# Use custom store
app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    replay_store=RedisReplayStore(redis_client)
)
```

---

## 🔑 Dependencies

- `fastapi` - Web framework
- `starlette` - ASGI toolkit
- `solders` - Solana SDK (for types)
- `base58` - Base58 encoding
- `pynacl` - Ed25519 signature verification

---

## 📚 Documentation

* [OpenKitx403 Protocol Specification](https://github.com/openkitx403/openkitx403)
* [Client SDK Documentation](https://github.com/openkitx403/openkitx403/tree/main/packages/client)
* [Security Best Practices](https://github.com/openkitx403/openkitx403/blob/main/SECURITY.md)

---

## 🪪 License

[MIT](https://github.com/openkitx403/openkitx403/blob/main/LICENSE)

