import { BaseChatModel } from "@langchain/core/language_models/chat_models";

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
  private llm: BaseChatModel;
  private config?: SwiftAgentConfig;

  constructor(llm: BaseChatModel, config?: SwiftAgentConfig) {
    this.llm = llm;
    this.config = config;
  }

  async run(query: string): Promise<string> {
    const response = await this.llm.invoke(query);
    return response.content as string;
  }
}

export default SwiftAgent;
