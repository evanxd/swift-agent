# SwiftAgent

A building block of agentic systems: an LLM that can retrieve information, use tools, and store user inputs.

## Description

SwiftAgent is designed to be a foundational component for building sophisticated AI agents. It provides a structured way to integrate Language Models (LLMs) with external tools via the Model Context Protocol (MCP) and manage conversation history.

## Features

*   **LLM Integration:** Easily integrate with various language models.
*   **Tool Usage:** Connect to and utilize tools provided by MCP servers.
*   **Message History:** Manages conversation history for stateful interactions.
*   **Extensible Options:** Configure the agent with custom options, including system prompts and MCP client settings.

## Installation

To install Swift Agent, you can use npm or yarn:

```bash
npm install swift-agent
# or
yarn add swift-agent
```

## Usage

Here's a basic example of how to use Swift Agent:

```typescript
import { ChatGoogleGenerativeAI as Model } from "@langchain/google-genai";
import SwiftAgent from "swift-agent";
import dotenv from "dotenv";

dotenv.config();

async function runAgent() {
  const llm = new Model({
    model: "gemini-2.5-flash-preview-04-17",
    apiKey: process.env.API_KEY, // Ensure you have API_KEY in your .env file
  });

  // Optional: Configure MCP servers
  const mcp = {
    mcpServers: {
      math: {
        command: "npx",
        args: ["-y", "nm-mcp-math"],
      },
      // Add other MCP servers here
    },
  };

  const agent = new SwiftAgent(llm, { mcp });

  // Run the agent with a message
  const result = await agent.run("what's (13 + 74) x 234?");
  console.log(result?.at(-1)?.content);
}

runAgent().catch(console.error);
```

## Example

A runnable example is provided in `examples/run-swift-agent.ts`. To run this example:

1.  Ensure you have a `.env` file in the project root with your `API_KEY` for the chosen LLM.
2.  Install dependencies: `npm install` or `yarn install`
3.  Run the example script:

```bash
npm run example
# or
yarn example
```

This example demonstrates using the agent with a Google Generative AI model and an MCP math server to perform a calculation.

## API

### `SwiftAgent(model: BaseChatModel, options?: SwiftAgentOptions)`

Creates a new instance of the SwiftAgent.

*   `model`: An instance of a LangChain `BaseChatModel`.
*   `options`: An optional object of type `SwiftAgentOptions`.
    *   `mcp`: Optional configuration for the `MultiServerMCPClient`.
        *   `mcpServers`: An object mapping server names to their command and arguments.
        *   `throwOnLoadError`: Whether to throw an error if an MCP server fails to load (defaults to `true`).
        *   `prefixToolNameWithServerName`: Whether to prefix tool names with the server name (defaults to `true`).
        *   `additionalToolNamePrefix`: An additional prefix to add to tool names (defaults to `"mcp"`).
    *   `messageHistory`: An optional array of `BaseMessage` to initialize the agent's message history.
    *   `systemPrompt`: An optional system prompt string to add to the beginning of the message history.

### `agent.run(message: string): Promise<BaseMessage[] | undefined>`

Runs the agent with a new human message.

*   `message`: The human message string to send to the agent.
*   Returns: A promise that resolves to an array of `BaseMessage` representing the agent's response, or `undefined` if an error occurred.

### `agent.setModel(model: BaseChatModel): void`

Sets the internal language model used by the agent.

*   `model`: An instance of a LangChain `BaseChatModel`.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/evanxd/swift-agent/blob/main/LICENSE) file for details.
