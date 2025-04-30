# Agent
Agent is an NPM module that implements a building block of agentic systems, which refers to an LLM enhanced with functionalities, such as information retrieval, tool use, and the memory storage of user inputs.

## Get Started
A few lines of code can build an AI agent that can retrieve real-time data of cryptocurrencies.

```ts
import { ChatOpenAI } from "@langchain/openai"
import Agent from "agent";

async function main() {
  const llm = new ChatOpenAI({ model: "gpt-4o" });
  const mcp = {
    mcpServers: {
      "coinmarketcap": {
        "command": "npx",
        "args": ["@shinzolabs/coinmarketcap-mcp"]
      }
    }
  };

  const agent = new Agent(llm, { mcp });
  const result = await agent.run("What is the current price of bitcoin?");

  console.log(result);
}

main().catch(console.error);
```
