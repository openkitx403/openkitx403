# OpenKitx403 Agent Python Examples

Production-ready examples demonstrating different use cases for the Python agent package.

## Installation

Install base package
pip install openkitx403-agent

Install with LangChain support
pip install openkitx403-agent[langchain]



## Examples

### 1. Standalone Agent (`standalone_example.py`)

Basic usage without AI framework dependencies.

python standalone_example.py



**Features:**
- Basic wallet connection
- GET and POST requests
- Error handling
- Batch request processing

### 2. LangChain Integration (`langchain_example.py`)

Complete LangChain integration with AI agents.

**Prerequisites:**
export OPENAI_API_KEY=your-key-here
pip install openkitx403-agent[langchain]



**Run:**
python langchain_example.py



**Features:**
- Basic AI agent tasks
- Multi-step complex reasoning
- Custom agent configurations
- Multiple wallet support

## Environment Variables

Required for LangChain examples
export OPENAI_API_KEY=sk-...

Optional configurations
export AGENT_TIMEOUT=30
export AGENT_RETRIES=3



## Use Cases Covered

✅ Wallet authentication to protected APIs  
✅ AI-powered decision making  
✅ Multi-step authentication flows  
✅ Error handling and retries  
✅ Batch request processing  
✅ Custom agent configurations  

## Next Steps

1. Replace API endpoints with your actual protected resources
2. Customize wallet keypairs for your use case
3. Extend LangChain prompts for specific tasks
4. Add custom error handling and logging
5. Integrate with your existing applications

## Troubleshooting

**Issue**: `ModuleNotFoundError: No module named 'langchain'`  
**Solution**: Install with `pip install openkitx403-agent[langchain]`

**Issue**: `OPENAI_API_KEY not found`  
**Solution**: Set environment variable with `export OPENAI_API_KEY=your-key`

**Issue**: Connection timeout errors  
**Solution**: Increase timeout in `AgentAuthOptions(timeout=60)`

## Support

For issues or questions:
- GitHub: https://github.com/openkitx403/openkitx403/issues
- Email: support@openkitx403.dev