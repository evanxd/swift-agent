import { BaseMessage } from "@langchain/core/messages";

interface MCPClientConfig extends MCP {
  throwOnLoadError: boolean;
  prefixToolNameWithServerName: boolean;
  additionalToolNamePrefix: string;
}

interface SwiftAgentOptions {
  mcp?: MCP;
  messageHistory?: BaseMessage[];
  systemPrompt?: string;
}

interface MCP {
  throwOnLoadError?: boolean;
  prefixToolNameWithServerName?: boolean;
  additionalToolNamePrefix?: string;
  mcpServers: {
    [serverName: string]: {
      command: string;
      args: string[];
    };
  };
}

export { MCPClientConfig, SwiftAgentOptions };
