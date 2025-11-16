import express from 'express';
import cors from 'cors';
import { createOpenKit403, inMemoryLRU } from '@openkitx403/server';

const app = express();
const PORT = 3000;

// CORS configuration
app.use(cors({ 
  origin: ['http://localhost:5173'], 
  credentials: true 
}));

// Create OpenKitx403 instance
const openkit = createOpenKit403({
  issuer: 'demo-api-v1',
  audience: 'http://localhost:3000',
  ttlSeconds: 60,
  bindMethodPath: true,
  replayStore: inMemoryLRU()
});

// Public health check endpoint (no authentication)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Protected routes
const protectedRouter = express.Router();
protectedRouter.use(openkit.middleware());

protectedRouter.get('/profile', (req, res) => {
  const user = (req as any).openkitx403User;
  res.json({
    address: user.address,
    username: `User_${user.address.slice(0, 6)}`, // Fixed: removed backslashes
    nftCount: 5,
    joinedAt: new Date().toISOString()
  });
});

// Additional protected endpoints
protectedRouter.get('/data', (req, res) => {
  const user = (req as any).openkitx403User;
  res.json({
    message: 'Protected data',
    wallet: user.address,
    timestamp: Date.now()
  });
});

protectedRouter.post('/submit', express.json(), (req, res) => {
  const user = (req as any).openkitx403User;
  res.json({
    success: true,
    wallet: user.address,
    data: req.body
  });
});

// Mount protected routes
app.use('/api', protectedRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ OpenKitx403 Demo Server running on http://localhost:${PORT}`); // Fixed: removed backslashes
  console.log(`📍 Public: http://localhost:${PORT}/health`);
  console.log(`🔒 Protected: http://localhost:${PORT}/api/profile`);
});
