import { describe, it, expect, beforeEach } from "vitest";
import { FakeChatModel } from "@langchain/core/utils/testing";

import SwiftAgent from "../src/swift-agent";

describe("SwiftAgent", () => {
  describe("Default Values", () => {
    let llm: FakeChatModel;
    let agent: SwiftAgent;

    beforeEach(() => {
      llm = new FakeChatModel({});
      agent = new SwiftAgent(llm, {
        mcp: {
          mcpServers: {
            "test-server": {
              command: "npx",
              args: ["test-server"],
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
});
