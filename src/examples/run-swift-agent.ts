import SwiftAgent from "../swift-agent";
import dotenv from "dotenv"
import { ChatGoogleGenerativeAI as LLM } from "@langchain/google-genai"

dotenv.config()

async function main() {
  const llm = new LLM({
    model: "gemini-2.5-flash-preview-04-17",
    apiKey: process.env.API_KEY // Add your API key into the .env file by adding API_KEY="your-api-key"
  });

  const agent = new SwiftAgent(llm);
  const result = await agent.run("Which is bigger, 9.3 or 9.11?");

  console.log(result);
}

main().catch(console.error);
