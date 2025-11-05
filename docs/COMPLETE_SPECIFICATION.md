# OpenKitx403 Protocol Specification

**Version**: 1.0  
**Status**: Draft  
**Last Updated**: 2025-11-05

## Abstract

OpenKitx403 defines an HTTP-native authentication protocol using HTTP 403 challenges for Solana wallet-based authentication. This specification describes the message formats, verification procedures, and security considerations for implementing compliant clients and servers.

## Table of Contents

1. [Introduction](#1-introduction)
2. [Protocol Overview](#2-protocol-overview)
3. [HTTP Headers](#3-http-headers)
4. [Challenge Format](#4-challenge-format)
5. [Authorization Format](#5-authorization-format)
6. [Verification Algorithm](#6-verification-algorithm)
7. [Security Considerations](#7-security-considerations)
8. [Extension Mechanisms](#8-extension-mechanisms)
9. [Error Handling](#9-error-handling)
10. [Examples](#10-examples)

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

```
┌──────┐                     ┌──────┐
│Client│                     │Server│
└──┬───┘                     └──┬───┘
   │                            │
   │  1. GET /protected        │
   ├──────────────────────────>│
   │                            │
   │  2. 403 Forbidden          │
   │     WWW-Authenticate: ...  │
   │<───────────────────────────┤
   │                            │
   │  [User signs challenge]    │
   │                            │
   │  3. GET /protected         │
   │     Authorization: ...     │
   ├──────────────────────────>│
   │                            │
   │  4. 200 OK                 │
   │<───────────────────────────┤
   │                            │
```

### 2.2 Protocol Name and Version

- **Scheme**: `OpenKitx403`
- **Current Version**: `1`
- **Algorithm**: `ed25519-solana`

All implementations MUST include `version="1"` in headers.

---

## 3. HTTP Headers

### 3.1 WWW-Authenticate Header (Server → Client)

**Format**:
```
WWW-Authenticate: OpenKitx403 realm="<realm>", version="1", challenge="<base64url>"
```

**Parameters**:
- `realm`: Server identifier (REQUIRED)
- `version`: Protocol version (REQUIRED, must be "1")
- `challenge`: Base64url-encoded JSON challenge (REQUIRED)

**Example**:
```http
HTTP/1.1 403 Forbidden
WWW-Authenticate: OpenKitx403 realm="api-v1", version="1", challenge="eyJ2IjoxLCJhbGciOi..."
Content-Type: application/json

{
  "error": "wallet_auth_required",
  "detail": "Sign the challenge using your Solana wallet."
}
```

### 3.2 Authorization Header (Client → Server)

**Format**:
```
Authorization: OpenKitx403 addr="<base58>", sig="<base58>", challenge="<base64url>", ts="<rfc3339>", nonce="<random>", bind="<method:path>"
```

**Parameters**:
- `addr`: Wallet public key in base58 (REQUIRED)
- `sig`: Ed25519 signature in base58 (REQUIRED)
- `challenge`: Challenge from WWW-Authenticate (REQUIRED)
- `ts`: ISO 8601/RFC 3339 timestamp (REQUIRED)
- `nonce`: Random value ≥96 bits (REQUIRED)
- `bind`: Request binding, format "METHOD:PATH" (OPTIONAL)

**Example**:
```http
GET /protected HTTP/1.1
Host: api.example.com
Authorization: OpenKitx403 addr="5Gv8...", sig="3kYz...", challenge="eyJ2Ijo...", ts="2025-11-05T10:30:00Z", nonce="X8p2...", bind="GET:/protected"
```

---

## 4. Challenge Format

### 4.1 JSON Structure

The challenge is a JSON object with the following fields:

```json
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
```

### 4.2 Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `v` | integer | Yes | Protocol version (must be 1) |
| `alg` | string | Yes | Algorithm (must be "ed25519-solana") |
| `nonce` | string | Yes | Server-generated random value |
| `ts` | string | Yes | Challenge creation timestamp (ISO 8601) |
| `aud` | string | Yes | Target audience (origin URL) |
| `method` | string | Yes | HTTP method |
| `path` | string | Yes | Request path |
| `uaBind` | boolean | Yes | Require User-Agent binding |
| `originBind` | boolean | Yes | Require Origin binding |
| `serverId` | string | Yes | Server identifier |
| `exp` | string | Yes | Expiration timestamp (ISO 8601) |
| `ext` | object | No | Extension data |

### 4.3 Encoding

Challenges MUST be:
1. Serialized as JSON with **sorted keys**
2. Encoded using **base64url** (RFC 4648, no padding)

### 4.4 Lifetime

- Default TTL: **60 seconds**
- Maximum recommended TTL: **300 seconds**
- Challenges MUST NOT be accepted after `exp` timestamp

---

## 5. Authorization Format

### 5.1 Signing String

The signing string is constructed as follows:

```
OpenKitx403 Challenge

domain: <aud>
server: <serverId>
nonce: <nonce>
ts: <ts>
method: <method>
path: <path>

payload: <json-challenge>
```

**Example**:
```
OpenKitx403 Challenge

domain: https://api.example.com
server: api-v1
nonce: E2o6p0q0Zl5PBjXc
ts: 2025-11-05T10:30:00Z
method: GET
path: /protected

payload: {"alg":"ed25519-solana","aud":"https://api.example.com",...}
```

### 5.2 Signature Generation

1. Construct signing string
2. Encode as UTF-8 bytes
3. Sign with Ed25519 using wallet private key
4. Encode signature as base58

### 5.3 Nonce Generation

Nonces MUST be:
- Cryptographically random
- At least 96 bits (12 bytes)
- Unique within TTL window
- Never reused with same wallet address

---

## 6. Verification Algorithm

### 6.1 Server Verification Steps

1. **Parse Authorization header**
   - Extract all required parameters
   - Fail if any required parameter missing

2. **Decode challenge**
   - Base64url decode challenge string
   - Parse JSON
   - Fail if invalid format

3. **Validate protocol version**
   - Check `v == 1`
   - Fail if unsupported version

4. **Validate algorithm**
   - Check `alg == "ed25519-solana"`
   - Fail if unsupported algorithm

5. **Check expiration**
   - Parse `exp` timestamp
   - Check `current_time < exp`
   - Fail if expired

6. **Validate audience**
   - Check `aud == expected_audience`
   - Fail if mismatch

7. **Validate server ID**
   - Check `serverId == expected_server_id`
   - Fail if mismatch

8. **Check timestamp skew**
   - Parse `ts` from Authorization
   - Check `|current_time - ts| <= clock_skew`
   - Default skew: 120 seconds
   - Fail if outside skew window

9. **Verify method/path binding**
   - If `bindMethodPath` enabled OR `bind` parameter present:
     - Check `method == challenge.method`
     - Check `path == challenge.path`
     - If `bind` parameter: check format "METHOD:PATH"
     - Fail if mismatch

10. **Verify origin binding**
    - If `originBind == true`:
      - Extract Origin or Referer header
      - Check origin matches `aud`
      - Fail if mismatch

11. **Verify User-Agent binding**
    - If `uaBind == true`:
      - Check User-Agent header exists
      - Fail if missing

12. **Check replay**
    - If replay store configured:
      - Check nonce not seen for this address
      - Store `addr:nonce` with TTL
      - Fail if nonce reused

13. **Verify signature**
    - Decode `addr` from base58 to public key
    - Decode `sig` from base58 to signature bytes
    - Reconstruct signing string
    - Verify Ed25519 signature
    - Fail if invalid signature

14. **Token gate check** (optional)
    - If token gate configured:
      - Call token gate function with address
      - Fail if not authorized

15. **Success**
    - Return authenticated user
    - Attach address to request context

### 6.2 Error Responses

On verification failure, server MUST:
- Return HTTP 403
- Include new WWW-Authenticate header
- Include error in response body

---

## 7. Security Considerations

### 7.1 Threats Considered

1. **Replay attacks**: Mitigated by nonce + TTL + replay store
2. **Cross-endpoint replay**: Mitigated by method/path binding
3. **Cross-origin replay**: Mitigated by origin binding
4. **Man-in-the-middle**: Requires HTTPS
5. **Clock skew attacks**: Mitigated by timestamp validation

### 7.2 Threats Not Fully Solved

1. **Compromised wallet**: No defense at protocol level
2. **Malicious browser extension**: Requires user vigilance
3. **Phishing**: Wallets should display challenge details

### 7.3 Recommendations

- **ALWAYS use HTTPS** in production
- **Enable replay protection** for high-value operations
- **Use method/path binding** for state-changing requests
- **Set short TTL** (60 seconds recommended)
- **Implement rate limiting** to prevent abuse
- **Monitor for anomalies** (unusual patterns, IPs)

### 7.4 Privacy Considerations

- Wallet addresses are **public information**
- Challenges do not leak sensitive data
- No PII required for authentication
- Consider address rotation for privacy-sensitive apps

---

## 8. Extension Mechanisms

### 8.1 ext Field

The `ext` field in challenges supports custom data:

```json
{
  "ext": {
    "gate": "nft-holders",
    "mint": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "minBalance": 1,
    "scopes": ["read:nfts", "write:metadata"]
  }
}
```

### 8.2 Token Gating

Servers MAY implement token gating by checking:
- NFT ownership
- SPL token balance
- On-chain program data
- External oracle data

### 8.3 Custom Scopes

Use `ext.scopes` for permission scoping:

```typescript
{
  ext: {
    scopes: ["read:wallet", "write:nfts", "admin:settings"]
  }
}
```

---

## 9. Error Handling

### 9.1 Error Codes

| Error Code | Description |
|------------|-------------|
| `wallet_auth_required` | No authentication provided |
| `invalid_challenge` | Malformed challenge |
| `challenge_expired` | Challenge TTL exceeded |
| `invalid_signature` | Signature verification failed |
| `replay_detected` | Nonce already used |
| `token_gate_failed` | Token requirements not met |
| `method_path_mismatch` | Binding verification failed |
| `origin_mismatch` | Origin binding failed |

### 9.2 Error Response Format

```json
{
  "error": "challenge_expired",
  "detail": "Challenge expired at 2025-11-05T10:31:00Z"
}
```

---

## 10. Examples

### 10.1 Complete HTTP Transcript

**Request 1: Initial Request**
```http
GET /protected HTTP/1.1
Host: api.example.com
```

**Response 1: Challenge**
```http
HTTP/1.1 403 Forbidden
WWW-Authenticate: OpenKitx403 realm="api-v1", version="1", challenge="eyJ2IjoxLCJhbGciOiJlZDI1NTE5LXNvbGFuYSIsIm5vbmNlIjoiRTJvNnAwcTBabDVQQmpYYyIsInRzIjoiMjAyNS0xMS0wNVQxMDozMDowMFoiLCJhdWQiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSIsIm1ldGhvZCI6IkdFVCIsInBhdGgiOiIvcHJvdGVjdGVkIiwidWFCaW5kIjpmYWxzZSwib3JpZ2luQmluZCI6dHJ1ZSwic2VydmVySWQiOiJhcGktdjEiLCJleHAiOiIyMDI1LTExLTA1VDEwOjMxOjAwWiIsImV4dCI6e319"
Content-Type: application/json

{
  "error": "wallet_auth_required",
  "detail": "Sign the challenge using your Solana wallet."
}
```

**Request 2: Authenticated Request**
```http
GET /protected HTTP/1.1
Host: api.example.com
Authorization: OpenKitx403 addr="5Gv8q5tGXPDwPM4x8Zhqrz5kQr5yL8m9z3K8fD6tY8hR", sig="3kYz8X2p9Q5m7nL4kF9sD1pR8hG6jV3wT2yN5xM8qE4rZ7pW9nK2mV5xC8dT3yL6fR9sE4hJ8pQ2mN5kV7xW3tY9rL6sE8pD4nF2kJ5xM7yR3wT8pV9qN6mC5sE7hL4kF2pJ9xR8yN3wT5mV7qE6sD8pL4kJ2nF9xR5yM3wT8pV6qN7mE9sC4hL5kF8pJ2xR7yN3wT9mV5qE6sD8pL4kJ2nF", challenge="eyJ2IjoxLCJhbGciOiJlZDI1NTE5LXNvbGFuYSIsIm5vbmNlIjoiRTJvNnAwcTBabDVQQmpYYyIsInRzIjoiMjAyNS0xMS0wNVQxMDozMDowMFoiLCJhdWQiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSIsIm1ldGhvZCI6IkdFVCIsInBhdGgiOiIvcHJvdGVjdGVkIiwidWFCaW5kIjpmYWxzZSwib3JpZ2luQmluZCI6dHJ1ZSwic2VydmVySWQiOiJhcGktdjEiLCJleHAiOiIyMDI1LTExLTA1VDEwOjMxOjAwWiIsImV4dCI6e319", ts="2025-11-05T10:30:15Z", nonce="X8p2q9R4m7L5kJ3nW6yT8pD", bind="GET:/protected"
```

**Response 2: Success**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Welcome!",
  "wallet": "5Gv8q5tGXPDwPM4x8Zhqrz5kQr5yL8m9z3K8fD6tY8hR",
  "timestamp": "2025-11-05T10:30:15Z"
}
```

### 10.2 cURL Examples

```bash
# Get challenge
curl -i https://api.example.com/protected

# Send authenticated request (after signing)
curl -H 'Authorization: OpenKitx403 addr="5Gv8...", sig="3kYz...", challenge="eyJ2...", ts="2025-11-05T10:30:15Z", nonce="X8p2...", bind="GET:/protected"' \
  https://api.example.com/protected
```

---

## Appendix A: Test Vectors

### Test Vector 1: Valid Challenge

**Challenge JSON**:
```json
{
  "alg": "ed25519-solana",
  "aud": "https://api.example.com",
  "exp": "2025-11-05T10:31:00Z",
  "ext": {},
  "method": "GET",
  "nonce": "test-nonce-12345",
  "originBind": true,
  "path": "/protected",
  "serverId": "test-server",
  "ts": "2025-11-05T10:30:00Z",
  "uaBind": false,
  "v": 1
}
```

**Base64url Encoded**:
```
eyJhbGciOiJlZDI1NTE5LXNvbGFuYSIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tIiwiZXhwIjoiMjAyNS0xMS0wNVQxMDozMTowMFoiLCJleHQiOnt9LCJtZXRob2QiOiJHRVQiLCJub25jZSI6InRlc3Qtbm9uY2UtMTIzNDUiLCJvcmlnaW5CaW5kIjp0cnVlLCJwYXRoIjoiL3Byb3RlY3RlZCIsInNlcnZlcklkIjoidGVzdC1zZXJ2ZXIiLCJ0cyI6IjIwMjUtMTEtMDVUMTA6MzA6MDBaIiwidWFCaW5kIjpmYWxzZSwidioxMX0
```

---

## Appendix B: Implementation Checklist

### Client Implementation
- [ ] HTTP 403 detection
- [ ] WWW-Authenticate parsing
- [ ] Challenge decoding
- [ ] Wallet connection
- [ ] Message signing
- [ ] Authorization header building
- [ ] Request retry logic

### Server Implementation
- [ ] Challenge generation
- [ ] WWW-Authenticate header
- [ ] Authorization parsing
- [ ] Timestamp validation
- [ ] Signature verification
- [ ] Replay protection
- [ ] Token gating (optional)
- [ ] Error responses

---

**End of Specification**
