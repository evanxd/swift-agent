import SwiftAgent from "../swift-agent";
import dotenv from "dotenv"
import { ChatGoogleGenerativeAI as Model } from "@langchain/google-genai"

dotenv.config()

async function main() {
  const model = new Model({
    model: "gemini-2.5-flash-preview-04-17",
    apiKey: process.env.API_KEY // Add your API key into the .env file by adding API_KEY="your-api-key"
  });

  const agent = new SwiftAgent(model);
  const messages = [{
      role: "system",
      content: "You are a helpful assistant! Your name is Alex."
    }, {
      role: "user",
      content: "What is your name?"
  }];
  const result = await agent.invoke(messages);

  console.log(result);
}

main().catch(console.error);
