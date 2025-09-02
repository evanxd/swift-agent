import dotenv from "dotenv";
import { ChatGoogleGenerativeAI as Model } from "@langchain/google-genai";

import { SwiftAgent } from "../src/index";

dotenv.config();

async function main() {
  const llm = new Model({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  });
  const mcp = {
    mcpServers: {
      math: {
        command: "npx",
        args: ["-y", "nm-mcp-math"],
      },
    },
  };
  const agent = new SwiftAgent(llm, { mcp });
  const result = await agent.run("what's (13 + 74) x 234?");
  console.log(result.at(-1)?.text);
  agent.disconnectMCPServers();
}

main().catch(console.error);
