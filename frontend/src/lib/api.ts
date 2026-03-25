import type { BoardColumnId, TaskApiRecord } from "./mockData";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export type ProjectRecord = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AgentRecord = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  status?: string;
  agent_type?: string;
  capabilities?: string[];
  created_at?: string;
  updated_at?: string;
};

export type RunRecord = {
  id: number;
  task_id: number;
  agent_id: number;
  pipeline_type: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  output_summary: string | null;
  output_payload: Record<string, unknown>;
  error_message: string | null;
  logs_text: string | null;
};

export type TaskCreatePayload = {
  project_id: number;
  title: string;
  description: string;
  status: BoardColumnId;
  priority: "low" | "medium" | "high" | "critical";
  assigned_agent_id: number | null;
  human_owner: string;
  labels: string[];
  due_date: string | null;
};

export type AgentCreatePayload = {
  name: string;
  slug?: string | null;
  description: string;
  status: string;
  agent_type: string;
  capabilities: string[];
  config?: Record<string, unknown> | null;
};

export type ProjectCreatePayload = {
  key: string;
  name: string;
  description: string;
};

export async function fetchTasks(): Promise<TaskApiRecord[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }
  return response.json();
}

export async function moveTask(taskId: number, status: BoardColumnId): Promise<TaskApiRecord> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to move task");
  }

  return response.json();
}

export async function createTask(payload: TaskCreatePayload): Promise<TaskApiRecord> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
}

export async function fetchProjects(): Promise<ProjectRecord[]> {
  const response = await fetch(`${API_BASE_URL}/projects`);
  if (!response.ok) {
    throw new Error("Failed to load projects");
  }
  return response.json();
}

export async function fetchAgents(): Promise<AgentRecord[]> {
  const response = await fetch(`${API_BASE_URL}/agents`);
  if (!response.ok) {
    throw new Error("Failed to load agents");
  }
  return response.json();
}

export async function createAgent(payload: AgentCreatePayload): Promise<AgentRecord> {
  const response = await fetch(`${API_BASE_URL}/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create agent");
  }

  return response.json();
}

export async function createProject(payload: ProjectCreatePayload): Promise<ProjectRecord> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json();
}

export async function fetchRuns(): Promise<RunRecord[]> {
  const response = await fetch(`${API_BASE_URL}/runs`);
  if (!response.ok) {
    throw new Error("Failed to load runs");
  }
  return response.json();
}
