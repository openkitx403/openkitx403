# openkitx403-agent

AI Agent toolkit for OpenKitx403 Solana wallet authentication.

## Installation

pip install openkitx403-agent

With LangChain support
pip install openkitx403-agent[langchain]



## Usage

### Standalone Agent

from solders.keypair import Keypair
from openkitx403_agent import OpenKit403Agent, AgentExecuteOptions

keypair = Keypair()
agent = OpenKit403Agent(keypair, auto_connect=True)

result = await agent.execute(
AgentExecuteOptions(resource="https://api.example.com/protected")
)
print(result)



### LangChain Integration

from solders.keypair import Keypair
from openkitx403_agent import SolanaWalletAuthTool
from langchain.agents import initialize_agent, AgentType
from langchain.llms import OpenAI

keypair = Keypair()
tools = [SolanaWalletAuthTool(keypair)]
llm = OpenAI(temperature=0)

agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
result = agent.run("Connect wallet and fetch profile from https://api.example.com/profile")



## API

See [full documentation](https://openkitx403.dev).
