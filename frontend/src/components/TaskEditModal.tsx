import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { BoardColumnId, TaskApiRecord } from "../lib/mockData";

const STATUS_DOT_COLORS: Partial<Record<BoardColumnId, string>> = {
  done: "var(--green)",
  failed: "var(--red)",
  develop: "var(--blue)",
  testing: "var(--amber)",
  architect: "var(--violet)",
  running: "var(--violet)",
};

type ProjectOption = {
  id: number;
  key: string;
  name: string;
};

type AgentOption = {
  id: number;
  name: string;
};

type StoryOption = {
  id: number;
  title: string;
};

type TaskEditModalProps = {
  task: TaskApiRecord | null;
  projects: ProjectOption[];
  agents: AgentOption[];
  stories: StoryOption[];
  subtasks: TaskApiRecord[];
  onClose: () => void;
  onUpdate: (taskId: number, payload: TaskEditFormValue) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
};

export type TaskEditFormValue = {
  title: string;
  short_description: string;
  implementation_description: string;
  definition_of_done: string;
  description: string;
  status: BoardColumnId;
  priority: TaskApiRecord["priority"];
  assigned_agent_id: number | null;
  human_owner: string;
  labels: string[];
  due_date: string | null;
  story_id: number | null;
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function TaskEditModal({ task, projects, agents, stories, subtasks, onClose, onUpdate, onDelete }: TaskEditModalProps) {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [implementationDescription, setImplementationDescription] = useState("");
  const [definitionOfDone, setDefinitionOfDone] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<BoardColumnId>("backlog");
  const [priority, setPriority] = useState<TaskApiRecord["priority"]>("medium");
  const [assignedAgentId, setAssignedAgentId] = useState<string>("");
  const [humanOwner, setHumanOwner] = useState("");
  const [labels, setLabels] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [storyId, setStoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setShortDescription(task.short_description ?? "");
    setImplementationDescription(task.implementation_description ?? "");
    setDefinitionOfDone(task.definition_of_done ?? "");
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setAssignedAgentId(task.assigned_agent_id ? String(task.assigned_agent_id) : "");
    setHumanOwner(task.human_owner ?? "");
    setLabels(task.labels.join(", "));
    setDueDate(toDatetimeLocal(task.due_date));
    setStoryId(task.story_id ? String(task.story_id) : "");
    setError(null);
    setIsSubmitting(false);
  }, [task]);

  if (!task) return null;

  const projectName = projects.find((p) => p.id === task.project_id);

  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-task-title">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {projectName ? `${projectName.key} · ${projectName.name}` : `Task #${task.id}`}
            </p>
            <h2 id="edit-task-title">Edit Task</h2>
          </div>
          <button type="button" className="icon-button icon-button--dark" onClick={onClose} aria-label="Close">
            ×
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
              await onUpdate(task.id, {
                title: title.trim(),
                short_description: shortDescription.trim(),
                implementation_description: implementationDescription.trim(),
                definition_of_done: definitionOfDone.trim(),
                description: description.trim(),
                status,
                priority,
                assigned_agent_id: assignedAgentId ? Number(assignedAgentId) : null,
                human_owner: humanOwner.trim(),
                labels: labels
                  .split(",")
                  .map((l) => l.trim())
                  .filter(Boolean),
                due_date: dueDate || null,
                story_id: storyId ? Number(storyId) : null,
              });
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Failed to update task");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </label>

          <label className="field">
            <span>Short Description <span className="field__hint">(shown on board card)</span></span>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief summary visible on the Kanban card"
              rows={3}
            />
          </label>

          <label className="field">
            <span>Implementation Description <span className="field__hint">(detailed notes)</span></span>
            <textarea
              value={implementationDescription}
              onChange={(e) => setImplementationDescription(e.target.value)}
              placeholder="Technical details, steps, acceptance criteria"
              rows={5}
            />
          </label>

          <label className="field">
            <span>Definition of Done</span>
            <textarea
              value={definitionOfDone}
              onChange={(e) => setDefinitionOfDone(e.target.value)}
              placeholder="Criteria that must be met for this task to be considered complete"
              rows={3}
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Story</span>
              <select value={storyId} onChange={(e) => setStoryId(e.target.value)}>
                <option value="">No story</option>
                {stories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as BoardColumnId)}>
                {["backlog", "architect", "develop", "testing", "done", "failed", "ready", "running", "review"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskApiRecord["priority"])}
              >
                {["low", "medium", "high", "critical"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Assigned Agent</span>
              <select value={assignedAgentId} onChange={(e) => setAssignedAgentId(e.target.value)}>
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Labels</span>
              <input
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="ui, backend"
              />
            </label>
          </div>

          {error ? <div className="status-banner status-banner--error">{error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {subtasks.length > 0 ? (
          <div className="subtask-section">
            <h3 className="subtask-section__title">Subtasks ({subtasks.length})</h3>
            <ul className="subtask-list">
              {subtasks.map((sub) => (
                <li key={sub.id} className="subtask-item">
                  <span
                    className="subtask-item__status-dot"
                    style={{ background: STATUS_DOT_COLORS[sub.status] ?? "var(--muted)" }}
                  />
                  <span className="subtask-item__title">{sub.title}</span>
                  <span className={`priority-chip priority-chip--${sub.priority}`}>{sub.priority}</span>
                  <span className="subtask-item__status-label">{sub.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="archive-card">
          <div className="archive-card__text">
            <strong>Archive task</strong>
            <p>Permanently removes this task and all its data. This cannot be undone.</p>
          </div>
          <button
            type="button"
            className="archive-card__btn"
            disabled={isDeleting || isSubmitting}
            onClick={async () => {
              setIsDeleting(true);
              try {
                await onDelete(task.id);
              } catch {
                setError("Failed to delete task.");
                setIsDeleting(false);
              }
            }}
          >
            {isDeleting ? "Deleting…" : "Delete task"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
