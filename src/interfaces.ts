interface MCPServerSettings {
  mcpServers: {
    [serverName: string]: {
      command: string;
      args: string[];
    };
  };
}

interface SwiftAgentConfig {
  mcp?: MCPServerSettings
}

interface Tool {
  name: string,
  description?: string,
  input_schema?: any,
}

export { MCPServerSettings, SwiftAgentConfig, Tool };
