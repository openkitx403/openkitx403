from typing import Optional
from openkitx403_client import OpenKit403Client
from .types import AgentAuthOptions, AgentAuthResult, AgentExecuteOptions

class OpenKit403Agent:
    def __init__(self, keypair, options: Optional[AgentAuthOptions] = None):
        self.client = OpenKit403Client(keypair)
        self.options = options or AgentAuthOptions()
        self.connected = False

        if self.options.auto_connect:
            self.connect()

    def connect(self) -> None:
        if self.connected:
            return
        self.connected = True

    def disconnect(self) -> None:
        if not self.connected:
            return
        self.connected = False

    async def execute(self, options: AgentExecuteOptions) -> AgentAuthResult:
        try:
            if not self.connected:
                self.connect()

            response = await self.client.authenticate(
                url=str(options.resource),
                method=options.method,
                headers=options.headers,
                body=options.body,
            )

            if response.ok:
                data = await response.json()
                return AgentAuthResult(
                    success=True,
                    address=self.client.address,
                    data=data,
                )
            else:
                return AgentAuthResult(
                    success=False,
                    error=f"HTTP {response.status}: {response.reason}",
                )
        except Exception as e:
            return AgentAuthResult(
                success=False,
                error=str(e),
            )

    @property
    def address(self) -> Optional[str]:
        return self.client.address if self.connected else None

    def is_connected(self) -> bool:
        return self.connected
