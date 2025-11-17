# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please:

1. **DO NOT** open a public issue  
2. Email us at: [security@openkitx403.dev](mailto:security@openkitx403.dev)  
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
2. **Enable replay protection** with replay store (e.g., Redis)  
3. **Use method/path binding** for sensitive operations  
4. **Set appropriate TTL** (60s recommended)  
5. **Implement rate limiting** on challenge and auth attempts  
6. **Monitor for suspicious activity**  
7. **Keep dependencies updated**  

### For Developers

1. **Validate all inputs** carefully  
2. **Use cryptographically secure random number generators**  
3. **Implement proper error handling and logging**  
4. **Follow principle of least privilege** in design  
5. **Review code for timing attack vulnerabilities**  
6. **Test edge cases thoroughly** and automate tests  

## Known Limitations

### Protocol Level

- Does not protect against compromised wallets (stolen keys)  
- Does not prevent phishing attacks; users must verify challenges  
- Requires explicit user approval for every signature  

### Implementation Level

- In-memory replay stores are not distributed and unsuitable for multiple instances  
- No built-in rate limiting (must be implemented separately)  
- Clock skew depends on system clock synchronization (recommend NTP)  

## Cryptographic Details

- **Algorithm**: Ed25519 (Curve25519)  
- **Signature**: Compatible with nacl/libsodium  
- **Nonce**: Minimum 96 bits cryptographic randomness  
- **Encoding**: Base58 (Solana standard for keys/signatures)  

## Dependencies

We regularly audit dependencies for vulnerabilities:

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

1. **Containment**: Disable affected systems or API access  
2. **Assessment**: Evaluate impact and scope quickly  
3. **Mitigation**: Apply patches and fixes  
4. **Communication**: Notify affected users and stakeholders  
5. **Post-mortem**: Document incident, root cause, and lessons learned  

## Contact

- Security Email: [security@openkitx403.dev](mailto:security@openkitx403.dev)  
- PGP Key: [To be added]  

---

**Last Updated**: 2025-11-16

