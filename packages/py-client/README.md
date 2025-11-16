# openkitx403-client — Python SDK

Lightweight **Python client** for authenticating with **OpenKitx403**-protected APIs using Solana wallets.

---

## 🚀 Installation

```bash
pip install openkitx403-client
# or
poetry add openkitx403-client
```

---

## ⚡ Quick Start

```python
from solders.keypair import Keypair
from openkitx403_client import OpenKit403Client

# Generate or load signing key (use secure storage in production)
keypair = Keypair()
print(f"Wallet address: {keypair.pubkey()}")

# Initialize client
client = OpenKit403Client(keypair)

#Authenticate against protected API
response = client.authenticate(
    url="https://api.example.com/protected",
    method="GET",
)

if response.ok:
    data = response.json()
    print("Authenticated:", data)
else:
    print(f"Authentication failed: {response.status_code}")

---

## 🔒 With Existing Keypair
from solders.keypair import Keypair
from openkitx403_client import OpenKit403Client

# Load from secret key bytes
secret_key_bytes = bytes([...]) # Your 64-byte secret key
keypair = Keypair.from_bytes(secret_key_bytes)

client = OpenKit403Client(keypair)
response = client.authenticate("https://api.example.com/data")
print(response.json())


---

## 🧩 API Reference

### `OpenKit403Client(keypair: Keypair)`

Authenticate requests to OpenKitx403-protected APIs using a Solana keypair.

**Parameters:**
- `keypair` (Keypair): Solana keypair from `solders.keypair.Keypair`

**Methods:**

| Method | Description |
|--------|-------------|
| `authenticate(url, method='GET', headers=None, data=None, json_data=None)` | Authenticates and executes a request, returns `requests.Response` |

**authenticate() Parameters:**
- `url` (str): Full API endpoint URL
- `method` (str): HTTP method (GET, POST, PUT, DELETE, etc.)
- `headers` (dict, optional): Additional HTTP headers
- `data` (dict, optional): Form data for POST/PUT
- `json_data` (dict, optional): JSON data for POST/PUT

**Returns:** `requests.Response` object

---

## 📝 POST Request Example

from solders.keypair import Keypair
from openkitx403_client import OpenKit403Client

keypair = Keypair()
client = OpenKit403Client(keypair)

# POST with JSON data
response = client.authenticate(
    url="https://api.example.com/submit",
    method="POST",
    json_data={"message": "Hello from OpenKitx403"}
)

print(response.json())
```

---

## 🔐 How It Works

1. Client makes initial request to protected endpoint
2. If server returns **403 with WWW-Authenticate challenge**
3. Client signs the challenge with Solana keypair
4. Client retries request with **Authorization header**
5. Server verifies signature and grants access

---

## 🔑 Dependencies

- `solders` - Solana Python SDK
- `requests` - HTTP client
- `base58` - Base58 encoding
- `pynacl` - Ed25519 signature verification

---

## 📚 Documentation

* [OpenKitx403 Protocol Specification](https://github.com/openkitx403/openkitx403)
* [Server SDK Documentation](https://github.com/openkitx403/openkitx403/tree/main/packages/server)
* [Security Best Practices](https://github.com/openkitx403/openkitx403/blob/main/SECURITY.md)

---

## 🪪 License

[MIT](https://github.com/openkitx403/openkitx403/blob/main/LICENSE)
