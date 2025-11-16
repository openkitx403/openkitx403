# OpenKitx403 Protocol Specification

**Version:** 1.0  
**Last Updated:** 2025-11-16

## Abstract

OpenKitx403 defines an HTTP-native authentication protocol using HTTP 403 challenges for Solana wallet-based authentication. This specification describes the message formats, verification procedures, and security considerations for implementing compliant clients and servers.

---

## 1. Introduction

### 1.1 Motivation

Traditional web authentication relies on centralized identity providers or long-lived sessions. OpenKitx403 enables **stateless, cryptographic wallet-based authentication** using standard HTTP semantics.

### 1.2 Design Goals

- **HTTP-native**: Use existing HTTP status codes and headers  
- **Stateless**: No server-side session storage required  
- **Secure**: Cryptographic signatures with replay protection  
- **Simple**: Easy to implement and deploy  
- **Extensible**: Support for token-gating and custom policies

### 1.3 Terminology

- **Wallet**: Solana Ed25519 keypair with address (public key)
- **Challenge**: Server-generated authentication task
- **Signature**: Ed25519 signature over challenge
- **Nonce**: Single-use random value for replay protection
- **TTL**: Time-To-Live for challenge validity

---

## 2. Protocol Overview

### 2.1 Authentication Flow

┌──────┐ ┌──────┐
│Client│ │Server│
└──┬───┘ └──┬───┘
│ │
│ 1. GET /protected │
├──────────────────────────>│
│ │
│ 2. 403 Forbidden │
│ WWW-Authenticate: ... │
│<───────────────────────────┤
│ │
│ [User signs challenge] │
│ │
│ 3. GET /protected │
│ Authorization: ... │
├──────────────────────────>│
│ │
│ 4. 200 OK │
│<───────────────────────────┤
│ │

### 2.2 Protocol Name and Version

- **Scheme**: `OpenKitx403`
- **Current Version**: `1`
- **Algorithm**: `ed25519-solana`
- All implementations MUST include `version="1"` in headers.

---

## 3. HTTP Headers

### 3.1 WWW-Authenticate Header (Server → Client)

**Format**:

WWW-Authenticate: OpenKitx403 realm="<realm>", version="1", challenge="<base64url>"

**Parameters**:
- `realm`: Server identifier (REQUIRED)
- `version`: Protocol version (REQUIRED, must be "1")
- `challenge`: Base64url-encoded JSON challenge (REQUIRED)

**Example**:

HTTP/1.1 403 Forbidden
WWW-Authenticate: OpenKitx403 realm="api-v1", version="1", challenge="eyJ2IjoxLCJhbGciOi..."
Content-Type: application/json

{
"error": "wallet_auth_required",
"detail": "Sign the challenge using your Solana wallet."
}


### 3.2 Authorization Header (Client → Server)

**Format**:

Authorization: OpenKitx403 addr="<base58>", sig="<base58>", challenge="<base64url>", ts="<rfc3339>", nonce="<random>", bind="method:path"


**Parameters**:
- `addr`: Wallet public key in base58 (REQUIRED)
- `sig`: Ed25519 signature in base58 (REQUIRED)
- `challenge`: Challenge from WWW-Authenticate (REQUIRED)
- `ts`: ISO 8601/RFC 3339 timestamp (REQUIRED)
- `nonce`: Random value ≥96 bits (REQUIRED)
- `bind`: Request binding, format "METHOD:PATH" (OPTIONAL)

**Example**:

GET /protected HTTP/1.1
Host: api.example.com
Authorization: OpenKitx403 addr="5Gv8...", sig="3kYz...", challenge="eyJ2Ijo...", ts="2025-11-05T10:30:00Z", nonce="X8p2...", bind="GET:/protected"

---

## 4. Challenge Format

### 4.1 JSON Structure

The challenge is a JSON object with the following fields:

{
"v": 1,
"alg": "ed25519-solana",
"nonce": "E2o6p0q0Zl5PBjXc",
"ts": "2025-11-05T10:30:00Z",
"aud": "https://api.example.com",
"method": "GET",
"path": "/protected",
"uaBind": false,
"originBind": true,
"serverId": "api-v1",
"exp": "2025-11-05T10:31:00Z",
"ext": {}
}

### 4.2 Field Definitions

| Field      | Type     | Required | Description                                          |
|------------|----------|----------|------------------------------------------------------|
| `v`        | integer  | Yes      | Protocol version (must be 1)                         |
| `alg`      | string   | Yes      | Algorithm (must be "ed25519-solana")                 |
| `nonce`    | string   | Yes      | Server-generated random value, ≥96 bits, base64url   |
| `ts`       | string   | Yes      | Challenge creation timestamp (ISO 8601/RFC 3339)     |
| `aud`      | string   | Yes      | Target audience (origin URL)                         |
| `method`   | string   | Yes      | HTTP method                                          |
| `path`     | string   | Yes      | Request path                                         |
| `uaBind`   | boolean  | Yes      | Require User-Agent binding                           |
| `originBind`| boolean | Yes      | Require Origin binding                               |
| `serverId` | string   | Yes      | Server identifier                                    |
| `exp`      | string   | Yes      | Expiration timestamp (ISO 8601)                      |
| `ext`      | object   | No       | Extension data                                       |

### 4.3 Encoding

- Challenges are JSON with **sorted keys**
- Use **base64url** encoding (RFC 4648, no padding)
- UTF-8 character encoding

---

## 5. Authorization Format

### 5.1 Signing String

Message for signing is constructed as:

OpenKitx403 Challenge

domain: <aud>
server: <serverId>
nonce: <nonce>
ts: <ts>
method: <method>
path: <path>

payload: <json-challenge>


### 5.2 Signature Generation

1. Construct signing string (above)
2. Encode as UTF-8 bytes
3. Sign with Ed25519 using wallet private key
4. Encode signature as base58

### 5.3 Nonce Generation

Nonces MUST be cryptographically random, ≥96 bits (12 bytes), unique per request.  
Example (TypeScript):
const nonce = crypto.getRandomValues(new Uint8Array(16));
const base64urlNonce = btoa(String.fromCharCode(...nonce))
.replace(/+/g, '-').replace(///g, '_').replace(/=+$/, '');

Example (Python):
import os, base64
nonce = base64.urlsafe_b64encode(os.urandom(12)).decode().rstrip("=")

---

## 6. Verification Algorithm

### 6.1 Server Verification Steps

1. Parse Authorization header (check all parameters)
2. Decode `challenge` from base64url, parse JSON, enforce sorted keys
3. Validate protocol version (`v == 1`)
4. Validate algorithm (`alg == "ed25519-solana"`)
5. Check `exp`: current_time < exp
6. Validate audience and server ID
7. Check timestamp skew: |current_time - ts| ≤ 120s
8. Enforce method/path binding if enabled
9. Verify Origin if `originBind` true
10. Verify User-Agent if `uaBind` true
11. Enforce replay protection (store/check nonce per addr and TTL)
12. Verify Ed25519 signature over correct signing string
13. Token gate check if configured
14. On success, attach address to request context and allow
15. On failure, return new 403 with WWW-Authenticate and error

---

## 7. Security Considerations

### 7.1 Recommendations

- **Always use HTTPS** in production.
- Enable **replay protection** using a distributed, persistent store (e.g., Redis) for stateful or high-value endpoints.
- Use **method/path binding** for all state-changing endpoints.
- Set **TTL ≤ 60 seconds** for all challenges.
- **Monitor for anomalies, rate limit challenge and failed attempts**.

### 7.2 Token Gating

The `ext` field in challenges supports custom gating logic—e.g., NFT, SPL token, or custom program checks.  
Example:
{ "ext": { "gate": {"type": "nft", "collection": "Xyz...", "minAmount": 1 } } }

---

## 8. Extension Mechanisms

- See `ext` field for custom gates and scopes.
- Use distinct keys for custom features (e.g., `{ "gate": ... }`).

---

## 9. Error Handling

### 9.1 Error Codes

| Code                  | Description                                 | Suggested Action                                   |
|-----------------------|---------------------------------------------|----------------------------------------------------|
| wallet_auth_required  | No authentication provided                  | Sign the challenge and retry                       |
| invalid_challenge     | Malformed challenge                         | Fetch a new challenge                              |
| challenge_expired     | TTL expired                                 | Fetch a new challenge                              |
| invalid_signature     | Signature verification failed               | Retry signing/verify wallet                        |
| replay_detected       | Nonce already used                          | Generate a new nonce and retry                     |
| token_gate_failed     | Token/NFT/SPL requirements not met          | See requirements in error body                     |
| method_path_mismatch  | Binding verification failed                 | Check method/path                                   |
| origin_mismatch       | Origin binding failed                       | Confirm Origin header/CORS setup                   |
| server_id_mismatch    | Wrong server                                 | Confirm challenge/serverId                         |
| timestamp_skew        | Client/Server clock difference too large    | Sync clock (NTP)                                   |

Example error response:
{
"error": "challenge_expired",
"error_description": "Challenge expired at 2025-11-05T10:31:00Z. Fetch a new challenge."
}
---

## 10. SDK Quick Start Examples

### TypeScript Client (Browser dApp)

import { OpenKit403Client } from '@openkitx403/client';
const client = new OpenKit403Client();
await client.connect('phantom');
const response = await client.authenticate({
resource: 'https://api.example.com/protected'
});
if (response.ok) {
const data = await response.json();
console.log('Wallet:', client.getAddress(), data);
}


### Python Client

from solders.keypair import Keypair
from openkitx403_client import OpenKit403Client

client = OpenKit403Client(Keypair())
resp = client.authenticate('https://api.example.com/protected')
if resp.ok:
print(resp.json())

### Express Server ReplayStore (Production Example)

import { ReplayStore } from '@openkitx403/server';
import Redis from 'ioredis';

class RedisReplayStore implements ReplayStore {
constructor(private redis: Redis) {}
async check(key: string, ttl: number) { return (await this.redis.exists(key)) === 1 }
async store(key: string, ttl: number) { await this.redis.setex(key, ttl, '1') }
}


---

## 11. Cross-Language Compatibility

- The protocol and SDKs are designed for TS <-> Python compatibility if:
  - JSON field order is sorted lexicographically
  - All encoding is base64url/base58 as specified
  - Timestamps and nonce rules are strictly enforced

---

## 12. Troubleshooting

- 403 with `challenge_expired` — Fetch a new challenge and retry.
- 403 with `replay_detected` — Your nonce was reused; always generate a new random nonce per request.
- 403 with `token_gate_failed` — Double-check token/NFT requirements and retry with compliant wallet.

---

## 13. Additional Resources

- **[Client and Server SDK READMEs](https://github.com/openkitx403/openkitx403/tree/main/packages)**
- **Security and deployment best practices:** See [SECURITY.md](./SECURITY.md)
- **Contact/Support:** [openkitx403 GitHub](https://github.com/openkitx403/openkitx403), Discord

---

**End of Specification**
