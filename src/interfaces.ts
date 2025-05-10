interface MCPServerSettings {
  throwOnLoadError?: boolean,
  prefixToolNameWithServerName?: boolean,
  additionalToolNamePrefix?: string,
  mcpServers: {
    [serverName: string]: {
      command: string;
      args: string[];
    };
  };
}

interface SwiftAgentOptions {
  mcp?: MCPServerSettings,
  systemPrompt?: string
}

export { MCPServerSettings, SwiftAgentOptions };
