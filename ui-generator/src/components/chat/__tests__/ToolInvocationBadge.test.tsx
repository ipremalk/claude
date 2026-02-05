import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

describe("ToolInvocationBadge", () => {
  describe("str_replace_editor tool", () => {
    it("displays 'Creating' for create command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/src/components/Button.tsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Creating Button.tsx")).toBeDefined();
    });

    it("displays 'Editing' for str_replace command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "/src/App.tsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Editing App.tsx")).toBeDefined();
    });

    it("displays 'Editing' for insert command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "insert", path: "/src/utils.ts" }}
          state="result"
        />
      );

      expect(screen.getByText("Editing utils.ts")).toBeDefined();
    });

    it("displays 'Viewing' for view command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "view", path: "/src/index.ts" }}
          state="result"
        />
      );

      expect(screen.getByText("Viewing index.ts")).toBeDefined();
    });

    it("displays 'Undoing' for undo_edit command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "undo_edit", path: "/src/Card.tsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Undoing Card.tsx")).toBeDefined();
    });

    it("displays 'Modifying' for unknown command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "unknown", path: "/src/test.ts" }}
          state="result"
        />
      );

      expect(screen.getByText("Modifying test.ts")).toBeDefined();
    });

    it("handles missing path gracefully", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create" }}
          state="result"
        />
      );

      expect(screen.getByText("Creating file")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    it("displays 'Deleting' for delete command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{ command: "delete", path: "/src/old.ts" }}
          state="result"
        />
      );

      expect(screen.getByText("Deleting old.ts")).toBeDefined();
    });

    it("displays 'Moving' with both filenames for rename command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{
            command: "rename",
            path: "/src/old.ts",
            new_path: "/src/new.ts",
          }}
          state="result"
        />
      );

      expect(screen.getByText("Moving old.ts → new.ts")).toBeDefined();
    });

    it("handles rename without new_path", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{ command: "rename", path: "/src/file.ts" }}
          state="result"
        />
      );

      expect(screen.getByText("Moving file.ts → new location")).toBeDefined();
    });
  });

  describe("unknown tools", () => {
    it("displays tool name for unknown tools", () => {
      render(
        <ToolInvocationBadge toolName="custom_tool" args={{}} state="result" />
      );

      expect(screen.getByText("custom_tool")).toBeDefined();
    });
  });

  describe("loading states", () => {
    it("shows loading spinner when state is not 'result'", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/src/Button.tsx" }}
          state="pending"
        />
      );

      expect(container.querySelector(".animate-spin")).toBeDefined();
    });

    it("shows green dot when state is 'result'", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/src/Button.tsx" }}
          state="result"
        />
      );

      expect(container.querySelector(".bg-emerald-500")).toBeDefined();
      expect(container.querySelector(".animate-spin")).toBeNull();
    });
  });
});
