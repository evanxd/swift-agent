import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { SwiftAgentOptions } from "./interfaces";

class SwiftAgent {
  private isMCPToolsInitialized: boolean = false;
  private mcpClient?: MultiServerMCPClient;
  private messages: Array<BaseMessage> = [];
  private model: BaseChatModel;
  private options?: SwiftAgentOptions;

  constructor(model: BaseChatModel, options?: SwiftAgentOptions) {
    this.model = model;
    this.options = options;
    if (this.options?.mcp) {
      this.mcpClient = new MultiServerMCPClient({
        ...this.options.mcp,
        throwOnLoadError: this.options.mcp.throwOnLoadError || true,
        prefixToolNameWithServerName:
          this.options.mcp.prefixToolNameWithServerName || true,
        additionalToolNamePrefix:
          this.options.mcp.additionalToolNamePrefix || "mcp",
      });
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
