
# OpenKitx403 Agent Examples

This directory contains production-ready examples demonstrating different use cases.

## Examples

### 1. Standalone Agent (`standalone-example.ts`)

Basic usage without any AI framework dependencies.

npm run build
node -r ts-node/register examples/standalone-example.ts



### 2. LangChain Integration (`langchain-example.ts`)

Complete LangChain integration with multiple scenarios.

**Prerequisites:**
export OPENAI_API_KEY=your-key-here
npm install langchain @langchain/openai



**Run:**
npm run build
node -r ts-node/register examples/langchain-example.ts



## Environment Variables

Required for LangChain examples
OPENAI_API_KEY=sk-...

Optional: Configure agent behavior
WALLET_TYPE=phantom # phantom | backpack | solflare
AGENT_TIMEOUT=30000
AGENT_RETRIES=3



## Use Cases Covered

- ✅ Basic wallet connection and authentication
- ✅ GET and POST requests to protected APIs
- ✅ LangChain AI agent integration
- ✅ Multi-step complex tasks
- ✅ Error handling and retry logic
- ✅ Multiple wallet support
- ✅ Custom agent configurations

## Next Steps

1. Modify the API endpoints to point to your protected resources
2. Customize wallet selection based on your needs
3. Extend the LangChain prompts for your specific use cases
4. Add custom error handling and logging