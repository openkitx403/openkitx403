# @openkitx403/server

Express and Fastify middleware for OpenKitx403 wallet authentication.

## Installation

```bash
npm install @openkitx403/server
```

## Usage

```typescript
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
  const user = req.openkitx403User;
  res.json({ wallet: user.address });
});
```

## Documentation

See [USAGE_EXAMPLES.md](../../USAGE_EXAMPLES.md) for complete guide.

## License

MIT
