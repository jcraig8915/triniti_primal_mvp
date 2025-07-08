/**
 * TRINITI Task Router
 * Converts natural language input to executable commands using pattern matching and fuzzy matching
 */

import { TaskCommand } from "../types/task";

// Enhanced command types to support different execution paths
export interface ParsedCommand {
  type: "file_operation" | "shell_command" | "general";
  operation?: "create" | "read" | "delete";
  path?: string;
  content?: string;
  command?: string;
  description: string;
}

type KnownAction =
  | { match: RegExp; template: (inp: string) => string }
  | { keywords: string[]; template: (inp: string) => string };

const ACTIONS: KnownAction[] = [
  // shell utilities
  { match: /^list files/i, template: () => "ls -la" },
  { match: /^show disk/i, template: () => "df -h" },
  { match: /^npm build/i, template: () => "npm run build" },
  { match: /^show memory/i, template: () => "free -h" },
  { match: /^show processes/i, template: () => "ps aux" },
  { match: /^show network/i, template: () => "netstat -tuln" },

  // git operations
  { match: /^git status/i, template: () => "git status" },
  { match: /^git log/i, template: () => "git log --oneline -10" },
  { match: /^git branch/i, template: () => "git branch -a" },
  {
    keywords: ["commit", "push"],
    template: () => "git add . && git commit -m \"WIP\" && git push"
  },
  {
    keywords: ["git", "pull"],
    template: () => "git pull origin main"
  },

  // file operations
  {
    keywords: ["create", "file"],
    template: (input: string) => {
      const matches = input.match(/create.*file\s+(\w+\.\w+)\s+with\s+text\s+"(.+)"/i);
      return matches
        ? `echo "${matches[2]}" > ${matches[1]}`
        : input;
    }
  },
  {
    keywords: ["delete", "file"],
    template: (input: string) => {
      const matches = input.match(/delete.*file\s+(\w+\.\w+)/i);
      return matches
        ? `rm ${matches[1]}`
        : input;
    }
  },
  {
    keywords: ["copy", "file"],
    template: (input: string) => {
      const matches = input.match(/copy.*file\s+(\w+\.\w+)\s+to\s+(\w+\.\w+)/i);
      return matches
        ? `cp ${matches[1]} ${matches[2]}`
        : input;
    }
  },

  // directory operations
  {
    keywords: ["list", "directory"],
    template: () => "ls -la"
  },
  {
    keywords: ["create", "directory"],
    template: (input: string) => {
      const matches = input.match(/create.*directory\s+(\w+)/i);
      return matches
        ? `mkdir ${matches[1]}`
        : input;
    }
  },

  // system operations
  {
    keywords: ["restart", "service"],
    template: (input: string) => {
      const matches = input.match(/restart.*service\s+(\w+)/i);
      return matches
        ? `sudo systemctl restart ${matches[1]}`
        : input;
    }
  },
  {
    keywords: ["check", "service"],
    template: (input: string) => {
      const matches = input.match(/check.*service\s+(\w+)/i);
      return matches
        ? `sudo systemctl status ${matches[1]}`
        : input;
    }
  }
];

/**
 * Parse file operations from natural language input
 */
export function parseFileOperation(input: string): ParsedCommand | null {
  // Check for explicit file_operation format first
  const fileOpPattern = /^file_operation:(create|read|delete):([^:]+)(?::(.+))?$/;
  const fileOpMatch = input.match(fileOpPattern);

  if (fileOpMatch) {
    const [_, operation, path, content] = fileOpMatch;
    return {
      type: "file_operation",
      operation: operation as "create" | "read" | "delete",
      path: path.trim(),
      content: content || "",
      description: input
    };
  }

  // Natural language pattern recognition for file operations
  const createFilePattern = /(create|write|make|new)\s+(?:a\s+)?file\s+(?:called|named)?\s+"?([^"]+)"?\s+(?:with\s+content\s+"?([^"]+)"?)?/i;
  const readFilePattern = /(read|open|show|display|cat)\s+(?:the\s+)?file\s+"?([^"]+)"?/i;
  const deleteFilePattern = /(delete|remove|erase)\s+(?:the\s+)?file\s+"?([^"]+)"?/i;

  const createMatch = input.match(createFilePattern);
  const readMatch = input.match(readFilePattern);
  const deleteMatch = input.match(deleteFilePattern);

  if (createMatch) {
    return {
      type: "file_operation",
      operation: "create",
      path: createMatch[2].trim(),
      content: createMatch[3] || "",
      description: input
    };
  } else if (readMatch) {
    return {
      type: "file_operation",
      operation: "read",
      path: readMatch[2].trim(),
      content: "",
      description: input
    };
  } else if (deleteMatch) {
    return {
      type: "file_operation",
      operation: "delete",
      path: deleteMatch[2].trim(),
      content: "",
      description: input
    };
  }

  return null;
}

/**
 * Routes natural language input to executable commands
 */
export function routeTask(nlInput: string): TaskCommand {
  // First, check for file operations
  const fileOp = parseFileOperation(nlInput);
  if (fileOp) {
    // Convert file operation to the expected format for the backend
    const command = `file_operation:${fileOp.operation}:${fileOp.path}${fileOp.content ? `:${fileOp.content}` : ''}`;
    return { raw: command, description: nlInput };
  }

  // Exact / RegExp matching for other commands
  for (const act of ACTIONS) {
    if ("match" in act && act.match.test(nlInput)) {
      return { raw: act.template(nlInput), description: nlInput };
    }
    if ("keywords" in act) {
      const score = act.keywords.reduce(
        (acc, k) => (nlInput.toLowerCase().includes(k) ? acc + 1 : acc),
        0
      );
      if (score === act.keywords.length)
        return { raw: act.template(nlInput), description: nlInput };
    }
  }

  // Simple fuzzy matching for close matches
  let bestMatch: { dist: number; template: (i: string) => string } | null = null;

  for (const act of ACTIONS) {
    if ("match" in act) {
      const dist = levenshteinDistance(nlInput.toLowerCase(), act.match.source.toLowerCase());
      if (!bestMatch || dist < bestMatch.dist) {
        bestMatch = { dist, template: act.template };
      }
    }
  }

  // Return best match or fallback to shell
  return bestMatch && bestMatch.dist < 10
    ? { raw: bestMatch.template(nlInput), description: nlInput }
    : { raw: nlInput, description: nlInput };
}

/**
 * Simple Levenshtein distance implementation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}
