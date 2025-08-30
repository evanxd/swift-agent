import { describe, it, expect, beforeEach, vi } from "vitest";
import { FakeChatModel } from "@langchain/core/utils/testing";

import SwiftAgent from "../src/index";

const MCP_SERVERS = {
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
        config: {
          mcpServers: MCP_SERVERS,
        },
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
  describe("Default Values", () => {
    let llm: FakeChatModel;
    let agent: SwiftAgent;

    beforeEach(() => {
      llm = new FakeChatModel({});
      agent = new SwiftAgent(llm, {
        mcp: {
          mcpServers: MCP_SERVERS,
        },
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
    let llm: FakeChatModel;
    let agent: SwiftAgent;

    beforeEach(async () => {
      llm = new FakeChatModel({});
      agent = new SwiftAgent(llm, {
        mcp: {
          mcpServers: MCP_SERVERS,
        },
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
    let llm: FakeChatModel;
    let agent: SwiftAgent;

    beforeEach(() => {
      llm = new FakeChatModel({});
      agent = new SwiftAgent(llm);
    });

    it("should update the internal model", () => {
      const newLlm = new FakeChatModel({});
      agent.setModel(newLlm);
      expect(agent.model).toBe(newLlm);
    });
  });

  describe("enableMcpServer", () => {
    let llm: FakeChatModel;
    let agent: SwiftAgent;

    beforeEach(async () => {
      llm = new FakeChatModel({});
      agent = new SwiftAgent(llm, {
        mcp: {
          mcpServers: MCP_SERVERS,
        },
      });
      await agent.run("hi");
    });

    it("should enable an MCP server by name", () => {
      agent.disableMcpServer("test-mcp-server-2");
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(false);
      agent.enableMcpServer("test-mcp-server-2");
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(true);
    });

    it("should not throw error if server name does not exist", () => {
      expect(() => agent.enableMcpServer("non-existent-server")).not.toThrow();
    });
  });

  describe("disableMcpServer", () => {
    let llm: FakeChatModel;
    let agent: SwiftAgent;

    beforeEach(async () => {
      llm = new FakeChatModel({});
      agent = new SwiftAgent(llm, {
        mcp: {
          mcpServers: MCP_SERVERS,
        },
      });
      await agent.run("hi");
    });

    it("should disable an MCP server by name", () => {
      agent.disableMcpServer("test-mcp-server-1");
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(false);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(false);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(true);
    });

    it("should not throw error if server name does not exist", () => {
      expect(() => agent.disableMcpServer("non-existent-server")).not.toThrow();
    });
  });
});
