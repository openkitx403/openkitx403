# openkitx403-client (Python)

Python client SDK for OpenKitx403 wallet authentication.

## Installation

\`\`\`bash
pip install openkitx403-client
\`\`\`

## Usage

\`\`\`python
from solana.keypair import Keypair
from openkitx403_client import OpenKit403Client

keypair = Keypair.generate()
client = OpenKit403Client(keypair)

response = client.authenticate('https://api.example.com/protected')
print(response.json())
\`\`\`

See USAGE_EXAMPLES.md for complete examples.
