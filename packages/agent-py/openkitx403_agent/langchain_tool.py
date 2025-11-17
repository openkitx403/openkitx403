from typing import Optional, Type
from pydantic import BaseModel, Field
from langchain.tools import BaseTool
from solders.keypair import Keypair
from .agent import OpenKit403Agent
from .types import AgentExecuteOptions

class SolanaWalletAuthInput(BaseModel):
    url: str = Field(description="API endpoint URL to authenticate against")
    method: str = Field(default="GET", description="HTTP method")

class SolanaWalletAuthTool(BaseTool):
    name: str = "solana_wallet_auth"
    description: str = "Authenticate to protected APIs using a Solana wallet"
    args_schema: Type[BaseModel] = SolanaWalletAuthInput

    def __init__(self, keypair: Optional[Keypair] = None):
        super().__init__()
        self.keypair = keypair or Keypair()
        self.agent = OpenKit403Agent(self.keypair, auto_connect=True)

    def _run(self, url: str, method: str = "GET") -> str:
        import asyncio
        result = asyncio.run(self.agent.execute(
            AgentExecuteOptions(resource=url, method=method)
        ))
        
        if result.success:
            return f"Success: {result.data}"
        else:
            return f"Error: {result.error}"

    async def _arun(self, url: str, method: str = "GET") -> str:
        result = await self.agent.execute(
            AgentExecuteOptions(resource=url, method=method)
        )
        
        if result.success:
            return f"Success: {result.data}"
        else:
            return f"Error: {result.error}"
