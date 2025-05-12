import { BaseMessage } from "@langchain/core/messages";

interface MCPServerSettings {
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

interface SwiftAgentOptions {
  mcp?: MCPServerSettings;
  messageHistory?: BaseMessage[];
  systemPrompt?: string;
}

export { MCPServerSettings, SwiftAgentOptions };
