# SwiftAgent
SwiftAgent is an NPM module that implements a building block of agentic systems, which refers to an LLM enhanced with functionalities, such as information retrieval, tool use, and the memory storage of user inputs.

## Get Started
A few lines of code can build an AI agent that can retrieve real-time data of cryptocurrencies.

```ts
import { ChatGoogleGenerativeAI as Model } from "@langchain/google-genai"
import SwiftAgent from "swift-agent";

async function main(): Promise<void> {
  const llm = new Model({ model: "gemini-2.5-flash-preview-04-17" });
  const mcp = {
    mcpServers: {
      "coinmarketcap": {
        "command": "npx",
        "args": ["@shinzolabs/coinmarketcap-mcp"]
      }
    }
  };

  const agent = new SwiftAgent(llm, { mcp });
  const result = await agent.run("What is the current price of bitcoin?");
  console.log(result?.at(-1)?.content);
}

main().catch(console.error);
```
