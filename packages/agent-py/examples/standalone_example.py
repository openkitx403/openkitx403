"""
Standalone Agent Example

This example demonstrates how to use OpenKit403Agent independently
without any AI framework integration.
"""

import asyncio
from solders.keypair import Keypair
from openkitx403_agent import OpenKit403Agent, AgentAuthOptions, AgentExecuteOptions


async def main():
    print("🚀 OpenKitx403 Standalone Agent Example\n")

    # Generate a keypair for testing
    keypair = Keypair()
    print(f"📝 Generated keypair: {keypair.pubkey()}\n")

    # Initialize agent
    agent = OpenKit403Agent(
        keypair,
        options=AgentAuthOptions(
            auto_connect=False,
            retries=3,
            timeout=30,
        ),
    )

    try:
        # Step 1: Connect
        print("📡 Connecting agent...")
        agent.connect()
        print(f"✅ Connected! Address: {agent.address}\n")

        # Step 2: Authenticate to a protected endpoint
        print("🔐 Authenticating to protected API...")
        result = await agent.execute(
            AgentExecuteOptions(
                resource="https://api.example.com/protected",
                method="GET",
            )
        )

        if result.success:
            print("✅ Authentication successful!")
            print(f"📋 Address: {result.address}")
            print(f"📦 Response data: {result.data}\n")
        else:
            print(f"❌ Authentication failed: {result.error}\n")

        # Step 3: POST request with body
        print("📤 Making POST request with data...")
        post_result = await agent.execute(
            AgentExecuteOptions(
                resource="https://api.example.com/nfts",
                method="POST",
                headers={"Content-Type": "application/json"},
                body={
                    "name": "My NFT Collection",
                    "description": "Created via OpenKitx403 Agent",
                    "items": 100,
                },
            )
        )

        if post_result.success:
            print("✅ POST request successful!")
            print(f"📦 Response: {post_result.data}\n")
        else:
            print(f"❌ POST request failed: {post_result.error}\n")

        # Step 4: Check connection status
        print(f"🔍 Connection status: {'Connected' if agent.is_connected() else 'Disconnected'}\n")

        # Step 5: Multiple requests example
        print("🔄 Making multiple authenticated requests...")
        endpoints = [
            "https://api.example.com/profile",
            "https://api.example.com/balance",
            "https://api.example.com/transactions",
        ]

        for endpoint in endpoints:
            result = await agent.execute(
                AgentExecuteOptions(resource=endpoint, method="GET")
            )
            status = "✅" if result.success else "❌"
            print(f"{status} {endpoint}: {result.data if result.success else result.error}")

    except Exception as e:
        print(f"❌ Error: {e}")

    finally:
        # Cleanup
        print("\n🔌 Disconnecting...")
        agent.disconnect()
        print("✅ Disconnected successfully")


async def error_handling_example():
    """Demonstrate error handling capabilities"""
    print("\n" + "=" * 60)
    print("🛡️  Error Handling Example")
    print("=" * 60 + "\n")

    keypair = Keypair()
    agent = OpenKit403Agent(keypair, options=AgentAuthOptions(auto_connect=True))

    # Test with invalid endpoint
    print("Testing invalid endpoint...")
    result = await agent.execute(
        AgentExecuteOptions(
            resource="https://invalid-api-endpoint-that-does-not-exist.com/test",
            method="GET",
        )
    )

    if not result.success:
        print(f"✅ Error handled correctly: {result.error}")
    else:
        print("❌ Expected error but got success")

    # Test with timeout
    print("\nTesting timeout handling...")
    agent_with_timeout = OpenKit403Agent(
        keypair,
        options=AgentAuthOptions(auto_connect=True, timeout=1),  # 1 second timeout
    )

    result = await agent_with_timeout.execute(
        AgentExecuteOptions(
            resource="https://api.example.com/slow-endpoint",
            method="GET",
        )
    )

    print(f"Result: {result.error if not result.success else 'Success'}")


async def batch_requests_example():
    """Demonstrate batch request processing"""
    print("\n" + "=" * 60)
    print("📦 Batch Requests Example")
    print("=" * 60 + "\n")

    keypair = Keypair()
    agent = OpenKit403Agent(keypair, options=AgentAuthOptions(auto_connect=True))

    # Define multiple requests
    requests = [
        AgentExecuteOptions(resource="https://api.example.com/user", method="GET"),
        AgentExecuteOptions(resource="https://api.example.com/nfts", method="GET"),
        AgentExecuteOptions(resource="https://api.example.com/tokens", method="GET"),
        AgentExecuteOptions(
            resource="https://api.example.com/trade",
            method="POST",
            body={"amount": 100, "token": "SOL"},
        ),
    ]

    # Execute all requests concurrently
    print("Executing batch requests...")
    tasks = [agent.execute(req) for req in requests]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Process results
    for i, result in enumerate(results, 1):
        if isinstance(result, Exception):
            print(f"❌ Request {i} failed with exception: {result}")
        elif result.success:
            print(f"✅ Request {i} succeeded: {result.data}")
        else:
            print(f"❌ Request {i} failed: {result.error}")


if __name__ == "__main__":
    print("=" * 60)
    print("  OpenKitx403 Agent Standalone Examples")
    print("=" * 60 + "\n")

    # Run main example
    asyncio.run(main())

    # Run additional examples
    asyncio.run(error_handling_example())
    asyncio.run(batch_requests_example())

    print("\n✅ All examples completed!")
