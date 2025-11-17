import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { OpenKit403Agent } from './agent';

const inputSchema = z.object({
  url: z.string().url().describe('The API endpoint URL to authenticate against'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET').describe('HTTP method'),
  wallet: z.enum(['phantom', 'backpack', 'solflare']).default('phantom').describe('Solana wallet to use'),
});

export class SolanaWalletAuthTool extends StructuredTool {
  name = 'solana_wallet_auth';
  description = 'Authenticate to protected APIs using a Solana wallet. Useful for accessing blockchain-gated APIs or Web3 services.';
  schema = inputSchema;

  private agent: OpenKit403Agent;

  constructor(wallet: 'phantom' | 'backpack' | 'solflare' = 'phantom') {
    super();
    this.agent = new OpenKit403Agent({ wallet, autoConnect: true });
  }

  protected async _call(input: z.infer<typeof inputSchema>): Promise<string> {
    try {
      const result = await this.agent.execute({
        resource: input.url,
        method: input.method,
      });

      if (result.success) {
        return JSON.stringify({
          success: true,
          address: result.address,
          data: result.data,
        }, null, 2);
      } else {
        return JSON.stringify({
          success: false,
          error: result.error,
        }, null, 2);
      }
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, null, 2);
    }
  }
}
