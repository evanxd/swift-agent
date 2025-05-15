import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import {
  MCPClientConfigInterface,
  SwiftAgentOptionsInterface,
  ToolInterface,
} from "./interfaces";

class SwiftAgent {
  private _model: BaseChatModel;
  private _options?: SwiftAgentOptionsInterface;
  private _mcpClient?: MultiServerMCPClient;
  private _tools: Array<ToolInterface> | undefined;
  private _agent: ReturnType<typeof createReactAgent> | undefined;
  private _messages: Array<BaseMessage> = [];
  private _isInitialized: boolean = false;

  constructor(model: BaseChatModel, options?: SwiftAgentOptionsInterface) {
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
        this._options.mcp as MCPClientConfigInterface,
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

  get tools() {
    return this._tools;
  }

  async run(message: string): Promise<BaseMessage[] | undefined> {
    if (!this._isInitialized) {
      const tools = (await this._mcpClient?.getTools()) as Array<ToolInterface>;
      this._tools = tools.map((tool) => {
        tool.isEnabled = true;
        return tool;
      });
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

  enableTool(name: string): void {
    this._setToolEnabled(name, true);
  }

  disableTool(name: string): void {
    this._setToolEnabled(name, false);
  }

  private _setToolEnabled(name: string, isEnabled: boolean = true): void {
    const tool = this._tools?.find((tool) => tool.name === name);
    if (tool) {
      tool.isEnabled = isEnabled;
    }
    this._agent = createReactAgent({
      llm: this._model,
      tools: this._tools?.filter((tool) => tool.isEnabled) || [],
    });
  }
}

export default SwiftAgent;
