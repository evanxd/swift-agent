import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { BaseMessageLike } from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import { SwiftAgentOptions } from "./interfaces"

class SwiftAgent {
  public messages: Array<BaseMessageLike> = [];
  private model: BaseChatModel;
  private mcpClient?: MultiServerMCPClient;
  private isMCPToolsInitialized: boolean = false;
  private options?: SwiftAgentOptions;

  constructor(model: BaseChatModel, options?: SwiftAgentOptions) {
    this.model = model;
    this.options = options;
    if (this.options?.mcp) {
      this.mcpClient = new MultiServerMCPClient({
        ...this.options.mcp,
        throwOnLoadError: this.options.mcp.throwOnLoadError || true,
        prefixToolNameWithServerName: this.options.mcp.prefixToolNameWithServerName || true,
        additionalToolNamePrefix: this.options.mcp.additionalToolNamePrefix || "mcp",
      });
    }
    if (options?.systemPrompt) {
      this.messages.push({ role: "system", content: options.systemPrompt });
    }
  }

  async run(message: BaseLanguageModelInput) {
    if (Array.isArray(message)) {
      this.messages = [...this.messages, ...message];
    } else if (typeof message === 'string') {
      this.messages.push({ role: "user", content: message });
    } else {
      // Assuming query is a PromptValue, convert it to string
      this.messages.push({ role: "user", content: message.toString() });
    }

    let tools;
    if (!this.isMCPToolsInitialized) {
      tools = await this.mcpClient?.getTools();
      this.isMCPToolsInitialized = true;
    }

    const agent = createReactAgent({ llm: this.model, tools: tools || [] });

    try {
      const response = await agent.invoke({ messages: this.messages });
      return response;
    } catch (e) {
      console.error("Error during agent execution:", e);
    }
  }
}

export default SwiftAgent;
