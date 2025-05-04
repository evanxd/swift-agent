import SwiftAgent from "../swift-agent";
import dotenv from "dotenv"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ChatGoogleGenerativeAI as LLM } from "@langchain/google-genai"

dotenv.config()

async function main() {
  const llm = new LLM({
    model: "gemini-2.5-flash-preview-04-17",
    apiKey: process.env.API_KEY // Add your API key into the .env file by adding API_KEY="your-api-key"
  });

  const agent = new SwiftAgent(llm);
  const messages = [
    new SystemMessage({ content: "You are a helpful assistant! Your name is Alex." }),
    new HumanMessage({ content: "What is your name?" })
  ];
  const result = await agent.run(messages);

  console.log(result);
}

main().catch(console.error);
