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
    bind_method_path=True,
    origin_binding=True,
    replay_backend="memory"
)

@app.get("/protected")
async def protected(user = Depends(require_openkitx403_user)):
    """Example protected endpoint"""
    return {
        "message": f"Authenticated as {user.address}",
        "wallet": user.address
    }
```

---

## 🔒 Optional Token Gating

```python
from openkitx403 import OpenKit403Middleware
from solana.rpc.api import Client
from solana.publickey import PublicKey

solana_client = Client("https://api.mainnet-beta.solana.com")

async def check_token_holder(address: str) -> bool:
    """Example: verify wallet holds specific token"""
    try:
        pubkey = PublicKey(address)
        resp = solana_client.get_token_accounts_by_owner(
            pubkey, {"mint": PublicKey("YOUR_TOKEN_MINT")}
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

## 🧩 API Overview

### `OpenKit403Middleware`

FastAPI middleware that adds OpenKitx403 authentication to your routes.

**Config Options:**

| Parameter          | Type       | Default    | Description                     |
| ------------------ | ---------- | ---------- | ------------------------------- |
| `audience`         | `str`      | required   | Expected origin or API audience |
| `issuer`           | `str`      | `"api-v1"` | Server identifier               |
| `ttl_seconds`      | `int`      | `60`       | Challenge TTL                   |
| `bind_method_path` | `bool`     | `True`     | Enable method/path binding      |
| `origin_binding`   | `bool`     | `False`    | Enable origin validation        |
| `replay_backend`   | `str`      | `"memory"` | Replay protection backend       |
| `token_gate`       | `Callable` | `None`     | Optional wallet gating logic    |

---

## 📚 Documentation

* [**Usage Examples → Python (FastAPI)**](../../USAGE_EXAMPLES.md#5-python-server-fastapi)
* [**Protocol Specification**](../../docs/SPEC.md)
* [**Security Guide**](../../SECURITY.md)

---

## 🪪 License

[MIT](../../LICENSE)
