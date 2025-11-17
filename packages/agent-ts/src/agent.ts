import { OpenKit403Client } from '@openkitx403/client';
import type { AgentAuthOptions, AgentAuthResult, AgentExecuteOptions } from './types';

export class OpenKit403Agent {
  private client: OpenKit403Client;
  private options: Required<AgentAuthOptions>;
  private connected: boolean = false;

  constructor(options: AgentAuthOptions = {}) {
    this.client = new OpenKit403Client();
    this.options = {
      wallet: options.wallet || 'phantom',
      autoConnect: options.autoConnect ?? false,
      retries: options.retries || 3,
      timeout: options.timeout || 30000,
    };

    if (this.options.autoConnect) {
      this.connect().catch(console.error);
    }
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    
    await this.client.connect(this.options.wallet);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    await this.client.disconnect();
    this.connected = false;
  }

  async execute(options: AgentExecuteOptions): Promise<AgentAuthResult> {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const response = await this.client.authenticate({
        resource: options.resource,
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          address: this.client.getAddress(),
          data,
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getAddress(): string | null {
    return this.connected ? this.client.getAddress() : null;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
