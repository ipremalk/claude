"use client";

import { Loader2, FileCode, FileX, FilePen, Eye, ArrowRightLeft } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args?: Record<string, unknown>;
  state: "pending" | "result" | string;
}

function getFileName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

function getToolDisplay(
  toolName: string,
  args?: Record<string, unknown>
): { label: string; icon: React.ReactNode } {
  const iconClass = "w-3 h-3";

  if (toolName === "str_replace_editor") {
    const command = args?.command as string | undefined;
    const path = args?.path as string | undefined;
    const fileName = path ? getFileName(path) : "file";

    switch (command) {
      case "view":
        return {
          label: `Viewing ${fileName}`,
          icon: <Eye className={iconClass} />,
        };
      case "create":
        return {
          label: `Creating ${fileName}`,
          icon: <FileCode className={iconClass} />,
        };
      case "str_replace":
      case "insert":
        return {
          label: `Editing ${fileName}`,
          icon: <FilePen className={iconClass} />,
        };
      case "undo_edit":
        return {
          label: `Undoing ${fileName}`,
          icon: <FilePen className={iconClass} />,
        };
      default:
        return {
          label: `Modifying ${fileName}`,
          icon: <FilePen className={iconClass} />,
        };
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command as string | undefined;
    const path = args?.path as string | undefined;
    const fileName = path ? getFileName(path) : "file";

    switch (command) {
      case "rename":
        const newPath = args?.new_path as string | undefined;
        const newFileName = newPath ? getFileName(newPath) : "new location";
        return {
          label: `Moving ${fileName} → ${newFileName}`,
          icon: <ArrowRightLeft className={iconClass} />,
        };
      case "delete":
        return {
          label: `Deleting ${fileName}`,
          icon: <FileX className={iconClass} />,
        };
      default:
        return {
          label: `Managing ${fileName}`,
          icon: <FilePen className={iconClass} />,
        };
    }
  }

  return {
    label: toolName,
    icon: <FileCode className={iconClass} />,
  };
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
}: ToolInvocationBadgeProps) {
  const isComplete = state === "result";
  const { label, icon } = getToolDisplay(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-medium border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-600">{icon}</span>
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
