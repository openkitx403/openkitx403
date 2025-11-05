import express from 'express';
import cors from 'cors';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const app = express();
const PORT = 3000;

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));

const openkit = createOpenKit403({
  issuer: 'demo-api-v1',
  audience: 'http://localhost:3000',
  ttlSeconds: 60,
  bindMethodPath: true,
  replayStore: inMemoryLRU()
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const protectedRouter = express.Router();
protectedRouter.use(openkit.middleware());

protectedRouter.get('/profile', (req, res) => {
  const user = (req as any).openkitx403User;
  res.json({
    address: user.address,
    openkitx403: \`User_\${user.address.slice(0, 6)}\`,
    nftCount: 5,
    joinedAt: new Date().toISOString()
  });
});

app.use('/api', protectedRouter);

app.listen(PORT, () => {
  console.log(\`✅ OpenKitx403 Demo Server running on http://localhost:\${PORT}\`);
});
