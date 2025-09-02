import { describe, it, expect, beforeEach, vi } from "vitest";
import { FakeChatModel } from "@langchain/core/utils/testing";

import { SwiftAgent } from "../src/index";

const mcpServers = {
  "test-mcp-server-1": {
    command: "npx",
    args: ["test-mcp-server-1"],
  },
  "test-mcp-server-2": {
    command: "npx",
    args: ["test-mcp-server-2"],
  },
};

vi.mock("@langchain/mcp-adapters", () => {
  return {
    MultiServerMCPClient: vi.fn().mockImplementation(() => {
      return {
        config: { mcpServers },
        getTools: vi.fn().mockImplementation((serverName: string) => {
          switch (serverName) {
            case "test-mcp-server-1":
              return [{ name: "test-tool-1" }, { name: "test-tool-2" }];
            case "test-mcp-server-2":
              return [{ name: "test-tool-3" }];
            default:
              return [];
          }
        }),
      };
    }),
  };
});

describe("SwiftAgent", () => {
  const llm = new FakeChatModel({});
  llm.bindTools = vi.fn().mockReturnValue(llm);

  describe("Default Values", () => {
    let agent: SwiftAgent;

    beforeEach(() => {
      agent = new SwiftAgent(llm, {
        mcp: { mcpServers },
      });
    });

    it("should default throwOnLoadError to true when mcp options are provided without it", () => {
      expect(agent.options?.mcp?.throwOnLoadError).toBe(true);
    });

    it("should default prefixToolNameWithServerName to true when mcp options are provided without it", () => {
      expect(agent.options?.mcp?.prefixToolNameWithServerName).toBe(true);
    });

    it("should default additionalToolNamePrefix to 'mcp' when mcp options are provided without it", () => {
      expect(agent.options?.mcp?.additionalToolNamePrefix).toBe("mcp");
    });
  });

  describe("run", () => {
    let agent: SwiftAgent;

    beforeEach(async () => {
      agent = new SwiftAgent(llm, {
        mcp: { mcpServers },
      });
      await agent.run("hi");
    });

    it("should load tools from MCP client", () => {
      expect(agent.tools).toHaveLength(3);
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(true);
    });
  });

  describe("setModel", () => {
    let agent: SwiftAgent;

    beforeEach(() => {
      agent = new SwiftAgent(llm);
    });

    it("should update the internal model", () => {
      const newLlm = new FakeChatModel({});
      agent.setModel(newLlm);
      expect(agent.model).toBe(newLlm);
    });
  });

  describe("enableMCPServer", () => {
    let agent: SwiftAgent;

    beforeEach(async () => {
      agent = new SwiftAgent(llm, {
        mcp: { mcpServers },
      });
      await agent.run("hi");
    });

    it("should enable an MCP server by name", () => {
      agent.disableMCPServer("test-mcp-server-2");
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(false);
      agent.enableMCPServer("test-mcp-server-2");
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(true);
    });

    it("should not throw error if server name does not exist", () => {
      expect(() => agent.enableMCPServer("non-existent-server")).not.toThrow();
    });
  });

  describe("disableMCPServer", () => {
    let agent: SwiftAgent;

    beforeEach(async () => {
      agent = new SwiftAgent(llm, {
        mcp: { mcpServers },
      });
      await agent.run("hi");
    });

    it("should disable an MCP server by name", () => {
      agent.disableMCPServer("test-mcp-server-1");
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(false);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(false);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(true);
    });

    it("should not throw error if server name does not exist", () => {
      expect(() => agent.disableMCPServer("non-existent-server")).not.toThrow();
    });
  });

  describe("resetMessages", () => {
    let agent: SwiftAgent;

    beforeEach(() => {
      agent = new SwiftAgent(llm, {
        systemPrompt: "You are a helpful assistant.",
      });
    });

    it("should clean all messages except the system message by default", async () => {
      await agent.run("hi");
      // @ts-expect-error - private property
      expect(agent._messages).toHaveLength(2);
      agent.resetMessages();
      // @ts-expect-error - private property
      expect(agent._messages).toHaveLength(1);
      // @ts-expect-error - private property
      expect(agent._messages[0].content).toBe("You are a helpful assistant.");
    });

    it("should clean all messages when keepSystemMessage is false", async () => {
      await agent.run("hi");
      // @ts-expect-error - private property
      expect(agent._messages).toHaveLength(2);
      agent.resetMessages(false);
      // @ts-expect-error - private property
      expect(agent._messages).toHaveLength(0);
    });
  });
});
