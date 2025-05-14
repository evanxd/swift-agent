import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { MCPClientConfig, SwiftAgentOptions } from "./interfaces";

class SwiftAgent {
  private _model: BaseChatModel;
  private _options?: SwiftAgentOptions;
  private _mcpClient?: MultiServerMCPClient;
  private _tools: Array<StructuredToolInterface> | undefined;
  private _agent: ReturnType<typeof createReactAgent> | undefined;
  private _messages: Array<BaseMessage> = [];
  private _isInitialized: boolean = false;

  constructor(model: BaseChatModel, options?: SwiftAgentOptions) {
    this._model = model;
    this._options = options;
    if (this._options?.mcp) {
      this._options.mcp.throwOnLoadError =
        this._options.mcp.throwOnLoadError || true;
      this._options.mcp.prefixToolNameWithServerName =
        this._options.mcp.prefixToolNameWithServerName || true;
      this._options.mcp.additionalToolNamePrefix =
        this._options.mcp.additionalToolNamePrefix || "mcp";
      this._mcpClient = new MultiServerMCPClient(
        this._options.mcp as MCPClientConfig,
      );
    }
    if (options?.messageHistory) {
      this._messages = options.messageHistory;
    }
    if (options?.systemPrompt) {
      if (this._messages.length === 0) {
        this._messages.push(new SystemMessage(options.systemPrompt));
      } else if (this._messages[0].getType() === "system") {
        this._messages[0].content = options.systemPrompt;
      } else {
        this._messages.unshift(new SystemMessage(options.systemPrompt));
      }
    }
  }

  get model() {
    return this._model;
  }

  get options() {
    return this._options;
  }

  async run(message: string): Promise<BaseMessage[] | undefined> {
    if (!this._isInitialized) {
      this._tools = await this._mcpClient?.getTools();
      this._agent = createReactAgent({
        llm: this._model,
        tools: this._tools || [],
      });
      this._isInitialized = true;
    }
    try {
      this._messages.push(new HumanMessage(message));
      if (this._agent) {
        const response = await this._agent.invoke({ messages: this._messages });
        return response.messages;
      } else {
        console.error("Agent not initialized.");
        return undefined;
      }
    } catch (e) {
      console.error("Error during agent execution:", e);
    }
  }

  setModel(model: BaseChatModel): void {
    this._model = model;
    this._agent = createReactAgent({
      llm: this._model,
      tools: this._tools || [],
    });
  }
}

export default SwiftAgent;
