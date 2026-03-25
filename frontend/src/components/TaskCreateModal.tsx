import { useEffect, useState } from "react";

import type { BoardColumnId, TaskApiRecord } from "../lib/mockData";

type ProjectOption = {
  id: number;
  key: string;
  name: string;
};

type AgentOption = {
  id: number;
  name: string;
};

type TaskCreateModalProps = {
  isOpen: boolean;
  defaultStatus: BoardColumnId;
  projects: ProjectOption[];
  agents: AgentOption[];
  onClose: () => void;
  onCreate: (payload: TaskCreateFormValue) => Promise<void>;
};

export type TaskCreateFormValue = {
  project_id: number;
  title: string;
  description: string;
  status: BoardColumnId;
  priority: TaskApiRecord["priority"];
  assigned_agent_id: number | null;
  human_owner: string;
  labels: string[];
  due_date: string | null;
};

const defaultPriority: TaskApiRecord["priority"] = "medium";

export function TaskCreateModal({
  isOpen,
  defaultStatus,
  projects,
  agents,
  onClose,
  onCreate,
}: TaskCreateModalProps) {
  const [projectId, setProjectId] = useState<number>(projects[0]?.id ?? 1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<BoardColumnId>(defaultStatus);
  const [priority, setPriority] = useState<TaskApiRecord["priority"]>(defaultPriority);
  const [assignedAgentId, setAssignedAgentId] = useState<string>("");
  const [humanOwner, setHumanOwner] = useState("Stanislav");
  const [labels, setLabels] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setProjectId(projects[0]?.id ?? 1);
    setTitle("");
    setDescription("");
    setStatus(defaultStatus);
    setPriority(defaultPriority);
    setAssignedAgentId("");
    setHumanOwner("Stanislav");
    setLabels("");
    setDueDate("");
    setError(null);
    setIsSubmitting(false);
  }, [defaultStatus, isOpen, projects]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-task-title">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Task Creation</p>
            <h2 id="create-task-title">Create Task</h2>
          </div>
          <button type="button" className="icon-button icon-button--dark" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!title.trim()) {
              setError("Title is required.");
              return;
            }
            setIsSubmitting(true);
            setError(null);
            try {
              await onCreate({
                project_id: projectId,
                title: title.trim(),
                description: description.trim(),
                status,
                priority,
                assigned_agent_id: assignedAgentId ? Number(assignedAgentId) : null,
                human_owner: humanOwner.trim(),
                labels: labels
                  .split(",")
                  .map((label) => label.trim())
                  .filter(Boolean),
                due_date: dueDate || null,
              });
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Failed to create task");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Write task title" />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add task details"
              rows={4}
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Project</span>
              <select value={projectId} onChange={(event) => setProjectId(Number(event.target.value))}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.key} · {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as BoardColumnId)}>
                {["backlog", "ready", "running", "review", "done", "failed"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value as TaskApiRecord["priority"])}>
                {["low", "medium", "high", "critical"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Assigned Agent</span>
              <select value={assignedAgentId} onChange={(event) => setAssignedAgentId(event.target.value)}>
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Owner</span>
              <input value={humanOwner} onChange={(event) => setHumanOwner(event.target.value)} />
            </label>

            <label className="field">
              <span>Due Date</span>
              <input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </label>
          </div>

          <label className="field">
            <span>Labels</span>
            <input value={labels} onChange={(event) => setLabels(event.target.value)} placeholder="ui, backend" />
          </label>

          {error ? <div className="status-banner status-banner--error">{error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
