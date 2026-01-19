"use client";

import { Loader2, Check, FileText, FilePlus, FileEdit, Trash2, FolderInput } from "lucide-react";

interface ToolInvocationArgs {
  command?: string;
  path?: string;
  new_path?: string;
}

export interface ToolInvocationData {
  toolName: string;
  state: "partial-call" | "call" | "result";
  args?: ToolInvocationArgs;
  result?: unknown;
}

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocationData;
}

type IconType = "loading" | "success" | "create" | "edit" | "delete" | "move" | "view";

interface ToolDisplayInfo {
  message: string;
  icon: IconType;
}

function getToolDisplayInfo(toolInvocation: ToolInvocationData): ToolDisplayInfo {
  const { toolName, state, args } = toolInvocation;
  const isComplete = state === "result";
  const command = args?.command;
  const path = args?.path || "file";
  const newPath = args?.new_path;

  if (toolName === "str_replace_editor" && command) {
    switch (command) {
      case "create":
        return {
          message: isComplete ? `Created ${path}` : `Creating ${path}`,
          icon: isComplete ? "success" : "create",
        };
      case "str_replace":
        return {
          message: isComplete ? `Edited ${path}` : `Editing ${path}`,
          icon: isComplete ? "success" : "edit",
        };
      case "insert":
        return {
          message: isComplete ? `Updated ${path}` : `Updating ${path}`,
          icon: isComplete ? "success" : "edit",
        };
      case "view":
        return {
          message: `Reading ${path}`,
          icon: "view",
        };
      default:
        return {
          message: isComplete ? `Completed ${command}` : `Running ${command}`,
          icon: isComplete ? "success" : "loading",
        };
    }
  }

  if (toolName === "file_manager" && command) {
    switch (command) {
      case "rename":
        return {
          message: isComplete
            ? `Moved ${path} → ${newPath || "new location"}`
            : `Moving ${path} → ${newPath || "new location"}`,
          icon: isComplete ? "success" : "move",
        };
      case "delete":
        return {
          message: isComplete ? `Deleted ${path}` : `Deleting ${path}`,
          icon: isComplete ? "success" : "delete",
        };
      default:
        return {
          message: isComplete ? `Completed ${command}` : `Running ${command}`,
          icon: isComplete ? "success" : "loading",
        };
    }
  }

  // Fallback for unknown tools
  return {
    message: toolName,
    icon: isComplete ? "success" : "loading",
  };
}

function ToolIcon({ type }: { type: IconType }) {
  const className = "w-3 h-3";

  switch (type) {
    case "loading":
      return <Loader2 className={`${className} animate-spin text-blue-600`} />;
    case "success":
      return <Check className={`${className} text-emerald-600`} />;
    case "create":
      return <FilePlus className={`${className} text-blue-600`} />;
    case "edit":
      return <FileEdit className={`${className} text-amber-600`} />;
    case "delete":
      return <Trash2 className={`${className} text-red-600`} />;
    case "move":
      return <FolderInput className={`${className} text-purple-600`} />;
    case "view":
      return <FileText className={`${className} text-neutral-600`} />;
    default:
      return <Loader2 className={`${className} animate-spin text-blue-600`} />;
  }
}

export function ToolInvocationDisplay({ toolInvocation }: ToolInvocationDisplayProps) {
  const { message, icon } = getToolDisplayInfo(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      <ToolIcon type={icon} />
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
