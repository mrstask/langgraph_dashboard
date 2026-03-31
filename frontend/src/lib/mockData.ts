export type DashboardTask = {
  id: number;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  runStatus: string;
  updatedAt: string;
  agentInitials: string;
  ownerInitials: string;
  storyTitle: string | null;
  actionLabel: "todo" | "review" | null;
  retryCount: number;
  hasMaxRetriesError: boolean;
  isSubtask: boolean;
};

export type BoardColumnId =
  | "backlog"
  | "ready"
  | "running"
  | "review"
  | "architect"
  | "develop"
  | "testing"
  | "done"
  | "failed";

export type BoardColumnData = {
  id: BoardColumnId;
  title: string;
  tone: "slate" | "blue" | "violet" | "amber" | "green" | "red";
  tasks: DashboardTask[];
};

export type TaskApiRecord = {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  short_description: string | null;
  implementation_description: string | null;
  definition_of_done: string | null;
  status: BoardColumnId;
  priority: "critical" | "high" | "medium" | "low";
  assigned_agent_id: number | null;
  human_owner: string | null;
  labels: string[];
  due_date: string | null;
  story_id: number | null;
  parent_task_id: number | null;
  created_at: string;
  updated_at: string;
};

const boardTemplate: Array<Omit<BoardColumnData, "tasks">> = [
  { id: "backlog", title: "Backlog", tone: "slate" },
  { id: "architect", title: "Architect", tone: "violet" },
  { id: "develop", title: "Develop", tone: "blue" },
  { id: "testing", title: "Testing", tone: "amber" },
  { id: "done", title: "Done", tone: "green" },
  { id: "failed", title: "Failed", tone: "red" },
];

export function buildBoardColumns(
  tasks: TaskApiRecord[],
  storiesMap: Map<number, string> = new Map(),
): BoardColumnData[] {
  return boardTemplate.map((column) => ({
    ...column,
    tasks: tasks
      .filter((task) => task.status === column.id)
      .map((task) => ({
        id: task.id,
        title: task.title,
        description: task.short_description ?? task.description ?? "",
        priority: task.priority,
        runStatus: deriveRunStatus(task.status),
        updatedAt: formatRelativeTime(task.updated_at),
        agentInitials: buildAgentInitials(task.assigned_agent_id),
        ownerInitials: buildOwnerInitials(task.human_owner),
        storyTitle: task.story_id != null ? (storiesMap.get(task.story_id) ?? null) : null,
        actionLabel: parseActionLabel(task.labels),
        retryCount: parseRetryCount(task.labels),
        hasMaxRetriesError: task.labels.includes("error:max-retries"),
        isSubtask: task.parent_task_id != null,
      })),
  }));
}

export function buildSummaryStats(columns: BoardColumnData[]) {
  const allTasks = columns.flatMap((column) => column.tasks);
  const activeCount =
    (columns.find((column) => column.id === "architect")?.tasks.length ?? 0) +
    (columns.find((column) => column.id === "develop")?.tasks.length ?? 0) +
    (columns.find((column) => column.id === "testing")?.tasks.length ?? 0);
  const failedCount = columns.find((column) => column.id === "failed")?.tasks.length ?? 0;
  const inReviewCount = allTasks.filter((t) => t.actionLabel === "review").length;

  return [
    {
      label: "Total Tasks",
      value: String(allTasks.length),
      detail: `${activeCount} active across agent lanes`,
    },
    {
      label: "Agents Online",
      value: "3",
      detail: "Live count is still mocked until agent API wiring lands",
    },
    {
      label: "Failed Runs",
      value: String(failedCount),
      detail: failedCount > 0 ? "Needs diagnostics review" : "No failed runs in the board",
    },
    {
      label: "Awaiting Review",
      value: String(inReviewCount),
      detail: inReviewCount > 0 ? "PM review pending" : "All tasks in progress",
    },
  ];
}

function parseActionLabel(labels: string[]): "todo" | "review" | null {
  if (labels.includes("action:todo")) return "todo";
  if (labels.includes("action:review")) return "review";
  return null;
}

function parseRetryCount(labels: string[]): number {
  for (const label of labels) {
    const match = label.match(/^retry:(\d+)$/);
    if (match) return parseInt(match[1], 10);
  }
  return 0;
}

function deriveRunStatus(status: BoardColumnId): string {
  switch (status) {
    case "architect":
    case "develop":
    case "testing":
    case "running":
      return "In progress";
    case "review":
      return "In review";
    case "done":
      return "Completed";
    case "failed":
      return "Failed";
    case "ready":
      return "Queued";
    default:
      return "No run";
  }
}

function buildAgentInitials(agentId: number | null): string {
  if (agentId === null) {
    return "--";
  }
  return `A${agentId}`;
}

function buildOwnerInitials(owner: string | null): string {
  if (!owner) {
    return "--";
  }
  const parts = owner.split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

