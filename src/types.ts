import { BaseMessage } from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { StructuredToolInterface } from "@langchain/core/tools";

export interface SwiftAgentOptions {
  mcp?: MCPServerConfig;
  messageHistory?: BaseMessage[];
  systemPrompt?: string;
}

export interface MCPServerTool extends StructuredToolInterface {
  serverName?: string;
  isEnabled?: boolean;
}

export type MCPServerConfig = ConstructorParameters<
  typeof MultiServerMCPClient
>[0];
