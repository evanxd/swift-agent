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

export class SwiftAgent {
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

  async run(message: string): Promise<BaseMessage[]> {
    if (!this._isInitialized) {
      this._tools = await this._getTools();
      this._agent = createReactAgent({
        llm: this._model,
        tools: this._tools,
      });
    }
    this._messages.push(new HumanMessage(message));
    if (this._agent) {
      this._isInitialized = true;
      const response = await this._agent.invoke({ messages: this._messages });
      return response.messages;
    } else {
      throw("The agent is not initialized yet.");
    }
  }

  setModel(model: BaseChatModel): void {
    this._model = model;
    this._agent = createReactAgent({
      llm: this._model,
      tools: this._tools || [],
    });
  }

  async disconnectMCPServers(): Promise<void> {
    if (this._mcpClient) {
      await this._mcpClient.close();
    }
  }

  enableMCPServer(serverName: string): void {
    this._setToolsEnabled(serverName, true);
  }

  disableMCPServer(serverName: string): void {
    this._setToolsEnabled(serverName, false);
  }

  resetMessages(keepSystemMessage = true): void {
    if (keepSystemMessage && this._messages[0]?.getType() === "system") {
      this._messages.splice(1);
    } else {
      this._messages = [];
    }
  }

  private async _getTools(): Promise<ToolInterface[]> {
    const allTools: Array<ToolInterface> = [];
    for (const serverName of Object.keys(
      this._mcpClient?.config.mcpServers || {},
    )) {
      const tools = (await this._mcpClient?.getTools(
        serverName,
      )) as Array<ToolInterface>;
      for (const tool of tools) {
        tool.serverName = serverName;
        tool.isEnabled = true;
      }
      allTools.push(...tools);
    }
    return allTools;
  }

  private _setToolsEnabled(
    serverName: string,
    isEnabled: boolean = true,
  ): void {
    const tools = this._tools?.filter((tool) => tool.serverName === serverName);
    if (!tools || tools.length === 0) {
      return;
    }
    for (const tool of tools) {
      tool.isEnabled = isEnabled;
    }
    this._agent = createReactAgent({
      llm: this._model,
      tools: this._tools?.filter((tool) => tool.isEnabled) || [],
    });
  }
}
