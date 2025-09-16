import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import {
  MCPServerConfig,
  MCPServerTool,
  SwiftAgentOptions,
} from "./types.js";

export class SwiftAgent {
  private agent?: ReturnType<typeof createReactAgent>;
  private mcpClient?: MultiServerMCPClient;
  private messages: BaseMessage[] = [];
  private model: BaseChatModel;
  private options?: SwiftAgentOptions;
  private tools: MCPServerTool[] = [];
  private toolsInitialized = false;

  constructor(model: BaseChatModel, options?: SwiftAgentOptions) {
    this.model = model;
    this.options = options;

    if (this.options?.mcp) {
      this.mcpClient = new MultiServerMCPClient(
        this.options.mcp as MCPServerConfig,
      );
    }
    if (options?.messageHistory) {
      this.messages = options.messageHistory;
    }
    if (options?.systemPrompt) {
      this.applySystemPrompt(options.systemPrompt);
    }
  }

  public async initialize(): Promise<void> {
    await this.getAgent();
  }

  public async run(message: string): Promise<BaseMessage[]> {
    const agent = await this.getAgent();
    this.messages.push(new HumanMessage(message));
    const response = await agent.invoke({ messages: this.messages });
    this.messages = response.messages;
    return this.messages;
  }

  public async getTools(): Promise<MCPServerTool[]> {
    if (!this.mcpClient || this.tools.length > 0) {
      return this.tools;
    }
    const mcpServers = this.mcpClient.config.mcpServers || {};
    const serverNames = Object.keys(mcpServers);

    this.tools = (await Promise.all(
      serverNames.map(async (serverName) => {
        const tools = (await this.mcpClient?.getTools(serverName)) as
          | MCPServerTool[]
          | undefined;
        if (!tools) {
          return [];
        }
        tools.forEach((tool) => {
          tool.serverName = serverName;
          tool.isEnabled = true;
        });
        return tools;
      }),
    )).flat();

    return this.tools;
  }

  public async disconnectMCPServers(): Promise<void> {
    if (this.mcpClient) {
      await this.mcpClient.close();
    }
  }

  public enableMCPServer(serverName: string): void {
    this.setToolsEnabled(serverName, true);
  }

  public disableMCPServer(serverName: string): void {
    this.setToolsEnabled(serverName, false);
  }

  public resetMessages(keepSystemMessage = true): void {
    if (keepSystemMessage && this.messages[0]?.getType() === "system") {
      this.messages.splice(1);
    } else {
      this.messages = [];
    }
  }

  private applySystemPrompt(systemPrompt: string): void {
    if (this.messages[0]?.getType() === "system") {
      this.messages[0].content = systemPrompt;
    } else {
      this.messages.unshift(new SystemMessage(systemPrompt));
    }
  }

  private async getAgent(): Promise<ReturnType<typeof createReactAgent>> {
    if (this.agent) {
      return this.agent;
    }

    if (!this.toolsInitialized) {
      this.tools = await this.getTools();
      this.toolsInitialized = true;
    }

    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools.filter((tool) => tool.isEnabled),
    });

    return this.agent;
  }

  private setToolsEnabled(serverName: string, isEnabled: boolean): void {
    const tools = this.tools.filter(
      (tool) => tool.serverName === serverName,
    );

    if (tools.length === 0) {
      return;
    }

    tools.forEach((tool) => {
      tool.isEnabled = isEnabled;
    });
  }
}
