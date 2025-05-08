import { Client } from "@modelcontextprotocol/sdk/client/index";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import { MCPServerSettings, Tool } from "./interfaces";

class MCPClientManager {
  public tools: Array<Tool> = [];
  private settings: MCPServerSettings;
  private clients: Array<Client> = [];
  private clientTools: Map<string, Client> = new Map();

  constructor(settings: MCPServerSettings) {
    this.settings = settings;
  }

  async connectMCPServers() {
    try {
      const mcpServers = this.settings.mcpServers;
      Object.keys(mcpServers).forEach((name) => {
        const client = new Client({ name: `mcp-client-${name}`, version: "1.0.0" })
        const transport = new StdioClientTransport({
          command: mcpServers[name].command,
          args: mcpServers[name].args
        });
        client.connect(transport);
        this.clients.push(client);
      });
      await this.listAllTools();
    } catch(e) {
      console.log("Failed to connect to MCP server: ", e);
      throw(e);
    }
  }

  getClientByToolName(name: string) : Client | undefined {
    return this.clientTools.get(name);
  }

  private async listAllTools() {
    for (const client of this.clients) {
      const toolsResult = await client.listTools();
      toolsResult.tools.forEach(tool => {
        this.clientTools.set(tool.name, client);
        this.tools.push({
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema
        });
      });
    }
  }
}

export default MCPClientManager;
