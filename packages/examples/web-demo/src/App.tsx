// src/App.tsx
import { useState } from 'react';
import { OpenKit403Client } from '@openkitx403/client';

type Wallet = 'phantom' | 'backpack' | 'solflare';

function App() {
  const [client] = useState(() => new OpenKit403Client());
  const [address, setAddress] = useState<string>();
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const authenticate = async (wallet: Wallet) => {
    setLoading(true);
    setError(undefined);
    setAddress(undefined);
    setData(undefined);

    try {
      await client.connect(wallet);

      // Authenticate and fetch protected resource
      const response = await client.authenticate({
        resource: 'http://localhost:3000/api/profile',
        method: 'GET'
      });

      if (response.ok) {
        setAddress(client.getAddress() ?? '');
        const responseData = await response.json();
        setData(responseData);
      } else {
        setError(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAddress(undefined);
    setData(undefined);
    setError(undefined);
    client.disconnect();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h1>OpenKitx403 Web Demo</h1>

      {!address ? (
        <div>
          <p>Connect your Solana wallet to authenticate:</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => authenticate('phantom')} disabled={loading}>
              {loading ? 'Connecting...' : 'Phantom'}
            </button>
            <button onClick={() => authenticate('backpack')} disabled={loading}>
              Backpack
            </button>
            <button onClick={() => authenticate('solflare')} disabled={loading}>
              Solflare
            </button>
          </div>
          {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        </div>
      ) : (
        <div>
          <h2>✅ Authenticated!</h2>
          <p><strong>Wallet:</strong> {address}</p>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 4, marginTop: 16 }}>
            {JSON.stringify(data, null, 2)}
          </pre>
          <button onClick={reset} style={{ marginTop: 16 }}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

export default App;