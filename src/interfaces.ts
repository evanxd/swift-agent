import { BaseMessage } from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
interface SwiftAgentOptionsInterface {
  mcp?: MCP;
  messageHistory?: BaseMessage[];
  systemPrompt?: string;
}
interface MCPClientConfigInterface extends MCP {
  throwOnLoadError: boolean;
  prefixToolNameWithServerName: boolean;
  additionalToolNamePrefix: string;
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

interface ToolInterface extends StructuredToolInterface {
  serverName?: string;
  isEnabled?: boolean;
}

export { MCPClientConfigInterface, SwiftAgentOptionsInterface, ToolInterface };
