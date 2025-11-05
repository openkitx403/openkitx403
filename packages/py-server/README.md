# openkitx403 - Python Server SDK

FastAPI middleware for OpenKitx403 wallet authentication.

## Installation

```bash
pip install openkitx403
```

## Quick Start

```python
from fastapi import FastAPI, Depends
from openkitx403 import OpenKit403Middleware, require_openkitx403_user

app = FastAPI()

app.add_middleware(
    OpenKit403Middleware,
    audience="https://api.example.com",
    issuer="my-api-v1",
    ttl_seconds=60,
    bind_method_path=True,
    replay_backend="memory"
)

@app.get("/protected")
async def protected(user = Depends(require_openkitx403_user)):
    return {"wallet": user.address}
```

## Documentation

See [USAGE_EXAMPLES.md](../../USAGE_EXAMPLES.md#5-python-server-fastapi) for complete examples.

## License

MIT
