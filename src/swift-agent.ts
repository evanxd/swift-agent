import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";

interface SwiftAgentConfig {
  mcp?: {
    mcpServers: {
      [serverName: string]: {
        command: string;
        args: string[];
      };
    };
  };
}

class SwiftAgent {
  private model: BaseChatModel;
  private config?: SwiftAgentConfig;

  constructor(model: BaseChatModel, config?: SwiftAgentConfig) {
    this.model = model;
    this.config = config;
  }

  async invoke(query: BaseLanguageModelInput): Promise<string> {
    const response = await this.model.invoke(query);
    return response.content as string;
  }
}

export default SwiftAgent;
