import { OpenKit403Agent } from '../src';

/**
 * Standalone Agent Example
 * 
 * This example demonstrates how to use OpenKit403Agent independently
 * without any AI framework integration.
 */

async function main() {
  console.log('🚀 OpenKitx403 Standalone Agent Example\n');

  // Initialize agent with Phantom wallet
  const agent = new OpenKit403Agent({
    wallet: 'phantom',
    autoConnect: false,
    retries: 3,
    timeout: 30000,
  });

  try {
    // Step 1: Connect wallet
    console.log('📡 Connecting to Phantom wallet...');
    await agent.connect();
    console.log('✅ Connected to wallet:', agent.getAddress());

    // Step 2: Authenticate to a protected endpoint
    console.log('\n🔐 Authenticating to protected API...');
    const result = await agent.execute({
      resource: 'https://api.example.com/protected',
      method: 'GET',
    });

    if (result.success) {
      console.log('✅ Authentication successful!');
      console.log('📋 Address:', result.address);
      console.log('📦 Response data:', JSON.stringify(result.data, null, 2));
    } else {
      console.error('❌ Authentication failed:', result.error);
    }

    // Step 3: POST request with body
    console.log('\n📤 Making POST request with data...');
    const postResult = await agent.execute({
      resource: 'https://api.example.com/nfts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name: 'My NFT Collection',
        description: 'Created via OpenKitx403 Agent',
        items: 100,
      },
    });

    if (postResult.success) {
      console.log('✅ POST request successful!');
      console.log('📦 Response:', JSON.stringify(postResult.data, null, 2));
    } else {
      console.error('❌ POST request failed:', postResult.error);
    }

    // Step 4: Check connection status
    console.log('\n🔍 Connection status:', agent.isConnected());

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    // Step 5: Cleanup
    console.log('\n🔌 Disconnecting...');
    await agent.disconnect();
    console.log('✅ Disconnected successfully');
  }
}

// Run the example
main().catch(console.error);
