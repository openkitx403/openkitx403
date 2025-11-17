# @openkitx403/agent

AI Agent toolkit for OpenKitx403 Solana wallet authentication.

## Installation
```
npm install @openkitx403/agent
```
## Usage

### Standalone Agent
```
import { OpenKit403Agent } from '@openkitx403/agent';

const agent = new OpenKit403Agent({
    wallet: 'phantom',
    autoConnect: true
});

const result = await agent.execute({
    resource: 'https://api.example.com/protected'
});

console.log(result);
```


### LangChain Integration
```
import { SolanaWalletAuthTool } from '@openkitx403/agent';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from 'langchain/chat_models/openai';

const model = new ChatOpenAI({ temperature: 0 });
const tools = [new SolanaWalletAuthTool('phantom')];

const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'openai-functions',
});

const result = await executor.invoke({
    input: 'Connect my Phantom wallet and fetch my profile from https://api.example.com/profile'
});
```


## API


See [full documentation](https://openkitx403.dev).
