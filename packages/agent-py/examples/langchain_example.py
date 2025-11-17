"""
LangChain Integration Example

This example demonstrates how to integrate OpenKit403Agent
with LangChain for AI-powered wallet authentication.
"""

import asyncio
import os
from solders.keypair import Keypair

try:
    from langchain.agents import initialize_agent, AgentType
    from langchain.llms import OpenAI
    from langchain_openai import ChatOpenAI
    from openkitx403_agent import SolanaWalletAuthTool
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("⚠️  LangChain not installed. Install with: pip install openkitx403-agent[langchain]")


async def basic_langchain_example():
    """Basic LangChain integration example"""
    if not LANGCHAIN_AVAILABLE:
        return

    print("🤖 OpenKitx403 + LangChain Basic Example\n")

    # Check for API key
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY environment variable is required")
        print("💡 Set it with: export OPENAI_API_KEY=your-key-here")
        return

    # Generate keypair
    keypair = Keypair()
    print(f"📝 Using wallet: {keypair.pubkey()}\n")

    # Initialize the Solana Wallet Auth Tool
    wallet_tool = SolanaWalletAuthTool(keypair)

    # Initialize OpenAI model
    llm = ChatOpenAI(
        model="gpt-4",
        temperature=0,
        openai_api_key=os.getenv("OPENAI_API_KEY"),
    )

    # Create agent
    agent = initialize_agent(
        [wallet_tool],
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
    )

    try:
        # Example 1: Simple authentication
        print("📋 Task 1: Authenticate and fetch user profile\n")
        result1 = agent.run(
            "Connect my Solana wallet and fetch my profile from https://api.example.com/profile"
        )
        print(f"✅ Result: {result1}\n")

        # Example 2: Complex multi-step task
        print("📋 Task 2: Multi-step NFT collection fetch\n")
        result2 = agent.run(
            "Authenticate to the NFT API at https://api.example.com/nfts and tell me how many NFTs I own"
        )
        print(f"✅ Result: {result2}\n")

        # Example 3: Conditional authentication
        print("📋 Task 3: Conditional access\n")
        result3 = agent.run(
            "Check if I have access to premium features at https://api.example.com/premium"
        )
        print(f"✅ Result: {result3}\n")

    except Exception as e:
        print(f"❌ Error: {e}")


async def advanced_langchain_example():
    """Advanced LangChain example with complex tasks"""
    if not LANGCHAIN_AVAILABLE:
        return

    print("\n🔬 OpenKitx403 + LangChain Advanced Example\n")

    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY required")
        return

    keypair = Keypair()
    wallet_tool = SolanaWalletAuthTool(keypair)

    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",
        temperature=0,
        openai_api_key=os.getenv("OPENAI_API_KEY"),
    )

    agent = initialize_agent(
        [wallet_tool],
        llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        verbose=True,
        max_iterations=5,
    )

    try:
        # Complex multi-step task
        result = agent.run("""
            I need you to:
            1. Authenticate my Solana wallet
            2. Fetch my NFT collection from https://api.example.com/nfts
            3. If I have more than 10 NFTs, check my premium status
            4. Summarize my collection details in a brief report
        """)

        print(f"✅ Advanced Result: {result}")

    except Exception as e:
        print(f"❌ Error: {e}")


async def custom_agent_example():
    """Custom agent with specific configurations"""
    if not LANGCHAIN_AVAILABLE:
        return

    print("\n⚙️  OpenKitx403 + Custom LangChain Agent\n")

    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY required")
        return

    keypair = Keypair()
    wallet_tool = SolanaWalletAuthTool(keypair)

    # Use different LLM configuration
    llm = OpenAI(
        model_name="gpt-3.5-turbo-instruct",
        temperature=0,
        max_tokens=500,
        openai_api_key=os.getenv("OPENAI_API_KEY"),
    )

    agent = initialize_agent(
        [wallet_tool],
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        max_iterations=3,
        early_stopping_method="generate",
    )

    try:
        result = agent.run(
            "Authenticate my wallet and retrieve my recent transaction history from the API"
        )
        print(f"✅ Custom Agent Result: {result}")

    except Exception as e:
        print(f"❌ Error: {e}")


async def multiple_tools_example():
    """Example with multiple tools and complex reasoning"""
    if not LANGCHAIN_AVAILABLE:
        return

    print("\n🔧 Multiple Tools Example\n")

    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY required")
        return

    # Create multiple tool instances for different purposes
    keypair1 = Keypair()
    keypair2 = Keypair()

    tool1 = SolanaWalletAuthTool(keypair1)
    tool2 = SolanaWalletAuthTool(keypair2)

    # Rename tools for distinction
    tool1.name = "primary_wallet_auth"
    tool1.description = "Authenticate using the primary Solana wallet"
    
    tool2.name = "secondary_wallet_auth"
    tool2.description = "Authenticate using the secondary Solana wallet"

    llm = ChatOpenAI(
        model="gpt-4",
        temperature=0,
        openai_api_key=os.getenv("OPENAI_API_KEY"),
    )

    agent = initialize_agent(
        [tool1, tool2],
        llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        verbose=True,
    )

    try:
        result = agent.run(
            "Use the primary wallet to check my NFT balance, "
            "then use the secondary wallet to verify my token holdings"
        )
        print(f"✅ Result: {result}")

    except Exception as e:
        print(f"❌ Error: {e}")


async def main():
    """Run all examples"""
    print("=" * 60)
    print("  OpenKitx403 LangChain Integration Examples")
    print("=" * 60 + "\n")

    if not LANGCHAIN_AVAILABLE:
        print("❌ LangChain is not installed")
        print("💡 Install with: pip install openkitx403-agent[langchain]")
        return

    # Run examples with delays between them
    await basic_langchain_example()
    await asyncio.sleep(2)

    await advanced_langchain_example()
    await asyncio.sleep(2)

    await custom_agent_example()
    await asyncio.sleep(2)

    await multiple_tools_example()

    print("\n✅ All LangChain examples completed!")


if __name__ == "__main__":
    asyncio.run(main())
