import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { MCPClientConfig, SwiftAgentOptions } from "./interfaces";

class SwiftAgent {
  private isMCPToolsInitialized: boolean = false;
  private mcpClient?: MultiServerMCPClient;
  private messages: Array<BaseMessage> = [];
  private model: BaseChatModel;
  private _options?: SwiftAgentOptions;

  constructor(model: BaseChatModel, options?: SwiftAgentOptions) {
    this.model = model;
    this._options = options;
    if (this._options?.mcp) {
      this._options.mcp.throwOnLoadError =
        this._options.mcp.throwOnLoadError || true;
      this._options.mcp.prefixToolNameWithServerName =
        this._options.mcp.prefixToolNameWithServerName || true;
      this._options.mcp.additionalToolNamePrefix =
        this._options.mcp.additionalToolNamePrefix || "mcp";
      this.mcpClient = new MultiServerMCPClient(
        this._options.mcp as MCPClientConfig,
      );
    }
    if (options?.messageHistory) {
      this.messages = options.messageHistory;
    }
    if (options?.systemPrompt) {
      if (this.messages.length === 0) {
        this.messages.push(new SystemMessage(options.systemPrompt));
      } else if (this.messages[0].getType() === "system") {
        this.messages[0].content = options.systemPrompt;
      } else {
        this.messages.unshift(new SystemMessage(options.systemPrompt));
      }
    }
  }

  get options() {
    return this._options;
  }

  async run(message: string): Promise<BaseMessage[] | undefined> {
    let tools;
    if (!this.isMCPToolsInitialized) {
      tools = await this.mcpClient?.getTools();
      this.isMCPToolsInitialized = true;
    }
    const agent = createReactAgent({ llm: this.model, tools: tools || [] });

    try {
      this.messages.push(new HumanMessage(message));
      const response = await agent.invoke({ messages: this.messages });
      return response.messages;
    } catch (e) {
      console.error("Error during agent execution:", e);
    }
  }
}

export default SwiftAgent;
