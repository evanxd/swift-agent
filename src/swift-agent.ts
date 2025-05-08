import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { BaseMessageLike, HumanMessage } from "@langchain/core/messages"
import { SwiftAgentConfig } from "./interfaces"

class SwiftAgent {
  public messages: Array<BaseMessageLike>;
  private model: BaseChatModel;
  private config?: SwiftAgentConfig;

  constructor(model: BaseChatModel, config?: SwiftAgentConfig) {
    this.messages = [];
    this.model = model;
    this.config = config;
  }

  async invoke(query: BaseLanguageModelInput): Promise<string> {
    if (Array.isArray(query)) {
      this.messages = [...this.messages, ...query];
    } else if (typeof query === 'string') {
      this.messages.push(new HumanMessage(query));
    } else {
      // Assuming query is a PromptValue, convert it to string
      this.messages.push(new HumanMessage(query.toString()));
    }
    const response = await this.model.invoke(this.messages);
    return response.content as string;
  }
}

export default SwiftAgent;
