import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationDisplay, ToolInvocationData } from "../ToolInvocationDisplay";

afterEach(() => {
  cleanup();
});

describe("ToolInvocationDisplay", () => {
  describe("str_replace_editor tool", () => {
    it("shows 'Creating' message when create command is in progress", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/App.jsx" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating /App.jsx")).toBeDefined();
    });

    it("shows 'Created' message when create command is complete", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/App.jsx" },
        result: "File created",
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Created /App.jsx")).toBeDefined();
    });

    it("shows 'Editing' message when str_replace command is in progress", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "str_replace", path: "/components/Card.jsx" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Editing /components/Card.jsx")).toBeDefined();
    });

    it("shows 'Edited' message when str_replace command is complete", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "str_replace", path: "/components/Card.jsx" },
        result: "Replaced 1 occurrence",
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Edited /components/Card.jsx")).toBeDefined();
    });

    it("shows 'Updating' message when insert command is in progress", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "insert", path: "/utils.ts" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Updating /utils.ts")).toBeDefined();
    });

    it("shows 'Updated' message when insert command is complete", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "insert", path: "/utils.ts" },
        result: "Text inserted",
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Updated /utils.ts")).toBeDefined();
    });

    it("shows 'Reading' message for view command", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "view", path: "/config.json" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Reading /config.json")).toBeDefined();
    });

    it("handles partial-call state same as call", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "partial-call",
        args: { command: "create", path: "/NewFile.tsx" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating /NewFile.tsx")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    it("shows 'Moving' message when rename command is in progress", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "file_manager",
        state: "call",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Moving /old.jsx → /new.jsx")).toBeDefined();
    });

    it("shows 'Moved' message when rename command is complete", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "file_manager",
        state: "result",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
        result: { success: true },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Moved /old.jsx → /new.jsx")).toBeDefined();
    });

    it("shows 'Deleting' message when delete command is in progress", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "file_manager",
        state: "call",
        args: { command: "delete", path: "/temp.txt" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Deleting /temp.txt")).toBeDefined();
    });

    it("shows 'Deleted' message when delete command is complete", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "file_manager",
        state: "result",
        args: { command: "delete", path: "/temp.txt" },
        result: { success: true },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Deleted /temp.txt")).toBeDefined();
    });

    it("handles rename without new_path gracefully", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "file_manager",
        state: "call",
        args: { command: "rename", path: "/old.jsx" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Moving /old.jsx → new location")).toBeDefined();
    });
  });

  describe("fallback behavior", () => {
    it("shows raw tool name for unknown tools", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "unknown_tool",
        state: "call",
        args: {},
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("unknown_tool")).toBeDefined();
    });

    it("handles missing args gracefully", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "call",
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("str_replace_editor")).toBeDefined();
    });

    it("handles missing path with fallback text", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Creating file")).toBeDefined();
    });

    it("handles unknown command for str_replace_editor", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "unknown_command", path: "/test.txt" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Running unknown_command")).toBeDefined();
    });

    it("handles unknown command for file_manager", () => {
      const toolInvocation: ToolInvocationData = {
        toolName: "file_manager",
        state: "result",
        args: { command: "unknown_command", path: "/test.txt" },
      };
      render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
      expect(screen.getByText("Completed unknown_command")).toBeDefined();
    });
  });
});
