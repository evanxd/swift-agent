import SwiftAgent from "../swift-agent";
import dotenv from "dotenv"
import { ChatGoogleGenerativeAI as Model } from "@langchain/google-genai"

dotenv.config()

async function main(): Promise<void> {
  const llm = new Model({
    model: "gemini-2.5-flash-preview-04-17",
    apiKey: process.env.API_KEY // Add your API key into the .env file by adding API_KEY="your-api-key"
  });
  const mcp = {
    mcpServers: {
      math: {
        command: "npx",
        args: ["-y", "nm-mcp-math"]
      }
    }
  };

  const agent = new SwiftAgent(llm, {
    mcp, systemPrompt: "You are a helpful assistant!"
  });
  const result = await agent.run("what's (13 + 74) x 234?");
  console.log(result?.at(-1)?.content);
}

main().catch(console.error);
