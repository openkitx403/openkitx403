export interface AgentAuthOptions {
  wallet?: 'phantom' | 'backpack' | 'solflare';
  autoConnect?: boolean;
  retries?: number;
  timeout?: number;
}

export interface AgentAuthResult {
  success: boolean;
  address?: string;
  data?: any;
  error?: string;
}

export interface AgentExecuteOptions {
  resource: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}
