import type { TaskApiRecord } from "./mockData";

export function matchesTaskSearch(task: TaskApiRecord, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    task.title,
    task.description ?? "",
    task.status,
    task.priority,
    task.human_owner ?? "",
    ...task.labels,
    task.assigned_agent_id ? `agent ${task.assigned_agent_id}` : "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}
