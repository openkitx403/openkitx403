"""OpenKitx403 - HTTP-native wallet authentication for Solana"""

__version__ = "0.1.3"

from .core import (
    Challenge,
    AuthorizationParams,
    VerifyResult,
    ReplayStore,
    InMemoryReplayStore,
    create_challenge,
    verify_authorization,
    base64url_encode,
    base64url_decode,
    generate_nonce,
    current_timestamp,
    parse_authorization_header,
    build_signing_string
)

from .middleware import (
    OpenKit403Config,
    OpenKit403Middleware,
    OpenKit403User,
    require_openkitx403_user
)

__all__ = [
    '__version__',
    'Challenge',
    'AuthorizationParams',
    'VerifyResult',
    'ReplayStore',
    'InMemoryReplayStore',
    'create_challenge',
    'verify_authorization',
    'base64url_encode',
    'base64url_decode',
    'generate_nonce',
    'current_timestamp',
    'parse_authorization_header',
    'build_signing_string',
    'OpenKit403Config',
    'OpenKit403Middleware',
    'OpenKit403User',
    'require_openkitx403_user'
]
