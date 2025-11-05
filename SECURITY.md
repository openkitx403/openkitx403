# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email us at: security@openkitx403.dev
3. Include detailed information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to expect

- **Response time**: Within 48 hours
- **Updates**: Every 5-7 days until resolved
- **Disclosure**: Coordinated disclosure after fix

## Security Best Practices

### For Users

1. **Always use HTTPS** in production
2. **Enable replay protection** with replay store
3. **Use method/path binding** for sensitive operations
4. **Set appropriate TTL** (60s recommended)
5. **Implement rate limiting**
6. **Monitor for suspicious activity**
7. **Keep dependencies updated**

### For Developers

1. **Validate all inputs**
2. **Use cryptographically secure random**
3. **Implement proper error handling**
4. **Follow principle of least privilege**
5. **Review code for timing attacks**
6. **Test edge cases thoroughly**

## Known Limitations

### Protocol Level
- Does not protect against compromised wallets
- Does not prevent phishing attacks
- Requires user to approve each signature

### Implementation Level
- In-memory replay store is not distributed
- No built-in rate limiting
- Clock skew dependent on system time

## Cryptographic Details

- **Algorithm**: Ed25519 (Curve25519)
- **Signature**: nacl/libsodium compatible
- **Nonce**: 96+ bits cryptographic random
- **Encoding**: Base58 (Solana standard)

## Dependencies

We regularly audit our dependencies for vulnerabilities:

### TypeScript
- @solana/web3.js
- @noble/ed25519
- bs58

### Python
- pynacl
- base58
- fastapi

Run `npm audit` and `pip audit` regularly.

## Incident Response

In case of a security incident:

1. **Containment**: Disable affected systems
2. **Assessment**: Evaluate scope and impact
3. **Mitigation**: Apply fixes
4. **Communication**: Notify affected users
5. **Post-mortem**: Document and improve

## Contact

- Security Email: security@openkitx403.dev
- PGP Key: [To be added]
- Discord: https://discord.gg/openkitx403

---

**Last Updated**: 2025-11-05
