# @openkitx403/client

Browser and Node.js client for OpenKitx403 wallet authentication.

## Installation

```bash
npm install @openkitx403/client
```

## Usage

```typescript
import { OpenKit403Client } from '@openkitx403/client';

const client = new OpenKit403Client();

await client.connect('phantom');

const result = await client.authenticate({
  resource: 'https://api.example.com/protected',
  method: 'GET'
});

if (result.ok) {
  console.log('Authenticated as:', result.address);
}
```

## Documentation

See [USAGE_EXAMPLES.md](../../USAGE_EXAMPLES.md) for complete guide.

## License

MIT
