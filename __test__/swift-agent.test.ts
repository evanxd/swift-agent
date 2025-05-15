import { describe, it, expect, beforeEach, vi } from "vitest";
import { FakeChatModel } from "@langchain/core/utils/testing";

import SwiftAgent from "../src/swift-agent";

vi.mock("@langchain/mcp-adapters", () => {
  return {
    MultiServerMCPClient: vi.fn().mockImplementation(() => {
      return {
        getTools: vi.fn().mockResolvedValue([
          { name: "test-tool-1" },
          { name: "test-tool-2" },
          { name: "test-tool-3" },
        ]),
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
          mcpServers: {
            "test-mcp-server": {
              command: "npx",
              args: ["test-mcp-server"],
            },
          },
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
          mcpServers: {
            "test-mcp-server": {
              command: "npx",
              args: ["test-mcp-server"],
            },
          },
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

  describe("enableTool", () => {
    let llm: FakeChatModel;
    let agent: SwiftAgent;

    beforeEach(async () => {
      llm = new FakeChatModel({});
      agent = new SwiftAgent(llm, {
        mcp: {
          mcpServers: {
            "test-mcp-server": {
              command: "npx",
              args: ["test-mcp-server"],
            },
          },
        },
      });
      await agent.run("hi");
    });

    it("should enable a tool by name", async () => {
      agent.disableTool("test-tool-2");
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(false);
      agent.enableTool("test-tool-2");
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(true);
    });

    it("should not throw error if tool name does not exist", () => {
      expect(() => agent.enableTool("non-existent-tool")).not.toThrow();
    });
  });

  describe("disableTool", () => {
    let llm: FakeChatModel;
    let agent: SwiftAgent;

    beforeEach(async () => {
      llm = new FakeChatModel({});
      agent = new SwiftAgent(llm, {
        mcp: {
          mcpServers: {
            "test-mcp-server": {
              command: "npx",
              args: ["test-mcp-server"],
            },
          },
        },
      });
      await agent.run("hi");
    });

    it("should disable a tool by name", () => {
      agent.disableTool("test-tool-3");
      expect(agent.tools?.find(tool => tool.name === "test-tool-1")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-2")?.isEnabled).toBe(true);
      expect(agent.tools?.find(tool => tool.name === "test-tool-3")?.isEnabled).toBe(false);
    });

    it("should not throw error if tool name does not exist", () => {
      expect(() => agent.disableTool("non-existent-tool")).not.toThrow();
    });
  });
});
