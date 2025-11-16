"""Tests for Python client"""

import pytest
from openkitx403_client import OpenKit403Client

def test_client_creation():
    """Test client can be created"""
    from solders.keypair import Keypair
    keypair = Keypair.generate()
    client = OpenKit403Client(keypair)
    assert client.address is not None
    assert isinstance(client.address, str)
    assert len(client.address) > 0
