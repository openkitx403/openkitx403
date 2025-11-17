import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SolanaWalletAuthTool } from '../src';

/**
 * LangChain Integration Example
 * 
 * This example demonstrates how to integrate OpenKit403Agent
 * with LangChain for AI-powered wallet authentication.
 */

async function basicLangChainExample() {
  console.log('🤖 OpenKitx403 + LangChain Basic Example\n');

  // Initialize the Solana Wallet Auth Tool
  const walletTool = new SolanaWalletAuthTool('phantom');

  // Initialize OpenAI model
  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Create prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant that can authenticate Solana wallets and interact with Web3 APIs.'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  // Create agent
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools: [walletTool],
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: [walletTool],
    verbose: true,
  });

  try {
    // Example 1: Simple authentication
    console.log('📋 Task 1: Authenticate and fetch user profile\n');
    const result1 = await executor.invoke({
      input: 'Connect my Phantom wallet and fetch my profile from https://api.example.com/profile',
    });
    console.log('✅ Result:', result1.output);

    // Example 2: Complex multi-step task
    console.log('\n📋 Task 2: Multi-step NFT collection fetch\n');
    const result2 = await executor.invoke({
      input: 'Connect my wallet, authenticate to the NFT API at https://api.example.com/nfts, and tell me how many NFTs I own',
    });
    console.log('✅ Result:', result2.output);

    // Example 3: Conditional authentication
    console.log('\n📋 Task 3: Conditional access\n');
    const result3 = await executor.invoke({
      input: 'Check if I have access to the premium features at https://api.example.com/premium by authenticating my wallet',
    });
    console.log('✅ Result:', result3.output);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

async function advancedLangChainExample() {
  console.log('\n🔬 OpenKitx403 + LangChain Advanced Example\n');

  // Multiple wallet support
  const phantomTool = new SolanaWalletAuthTool('phantom');
  const backpackTool = new SolanaWalletAuthTool('backpack');

  // Rename tools for distinction
  phantomTool.name = 'phantom_wallet_auth';
  phantomTool.description = 'Authenticate using Phantom wallet to access Web3 APIs';
  
  backpackTool.name = 'backpack_wallet_auth';
  backpackTool.description = 'Authenticate using Backpack wallet to access Web3 APIs';

  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a Web3 assistant with access to multiple Solana wallets. Help users authenticate and interact with blockchain APIs.'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools: [phantomTool, backpackTool],
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: [phantomTool, backpackTool],
    verbose: true,
    maxIterations: 10,
  });

  try {
    // Complex task with decision making
    const result = await executor.invoke({
      input: `
        I need you to:
        1. Connect my Phantom wallet
        2. Fetch my NFT collection from https://api.example.com/nfts
        3. If I have more than 10 NFTs, authenticate to the premium API
        4. Summarize my collection details
      `,
    });

    console.log('✅ Advanced Result:', result.output);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

async function customAgentExample() {
  console.log('\n⚙️ OpenKitx403 + Custom LangChain Agent\n');

  const walletTool = new SolanaWalletAuthTool('phantom');

  const model = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a blockchain transaction specialist. Help users authenticate wallets and retrieve their transaction history.'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  // Custom agent with specific instructions
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools: [walletTool],
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: [walletTool],
    verbose: true,
    maxIterations: 5,
    returnIntermediateSteps: true,
  });

  try {
    const result = await executor.invoke({
      input: 'Authenticate my wallet and retrieve all my transaction history from the API at https://api.example.com/transactions',
    });

    console.log('✅ Custom Agent Result:', result.output);
    
    if (result.intermediateSteps && result.intermediateSteps.length > 0) {
      console.log('\n📊 Intermediate Steps:');
      result.intermediateSteps.forEach((step: any, index: number) => {
        console.log(`\nStep ${index + 1}:`, JSON.stringify(step, null, 2));
      });
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

async function streamingExample() {
  console.log('\n🌊 Streaming Response Example\n');

  const walletTool = new SolanaWalletAuthTool('phantom');

  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful Web3 assistant.'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools: [walletTool],
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: [walletTool],
    verbose: true,
  });

  try {
    console.log('Starting streaming response...\n');
    
    const stream = await executor.stream({
      input: 'Authenticate my wallet and check my NFT balance at https://api.example.com/nfts',
    });

    for await (const chunk of stream) {
      if (chunk.output) {
        process.stdout.write(chunk.output);
      }
    }
    
    console.log('\n\n✅ Streaming complete');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  OpenKitx403 LangChain Integration Examples');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    console.log('💡 Set it with: export OPENAI_API_KEY=your-key-here');
    process.exit(1);
  }

  // Run examples
  await basicLangChainExample();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between examples
  
  await advancedLangChainExample();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await customAgentExample();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await streamingExample();

  console.log('\n✅ All examples completed successfully!');
}

// Run all examples
main().catch(console.error);
