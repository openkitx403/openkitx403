from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, HttpUrl

WalletType = Literal['phantom', 'backpack', 'solflare']

class AgentAuthOptions(BaseModel):
    wallet: WalletType = 'phantom'
    auto_connect: bool = False
    retries: int = 3
    timeout: int = 30

class AgentAuthResult(BaseModel):
    success: bool
    address: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class AgentExecuteOptions(BaseModel):
    resource: HttpUrl
    method: str = 'GET'
    headers: Optional[Dict[str, str]] = None
    body: Optional[Dict[str, Any]] = None
