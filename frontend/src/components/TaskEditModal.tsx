import { useEffect, useReducer } from "react";
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

type ProjectOption = { id: number; key: string; name: string };
type AgentOption = { id: number; name: string };
type StoryOption = { id: number; title: string };

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
  parent_task_id: number | null;
  queue_position: number | null;
};

type FormState = {
  title: string;
  shortDescription: string;
  implementationDescription: string;
  definitionOfDone: string;
  description: string;
  status: BoardColumnId;
  priority: TaskApiRecord["priority"];
  assignedAgentId: string;
  humanOwner: string;
  labels: string;
  dueDate: string;
  storyId: string;
  isSubmitting: boolean;
  isDeleting: boolean;
  error: string | null;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string | number | boolean | null }
  | { type: "LOAD"; task: TaskApiRecord };

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "LOAD": {
      const t = action.task;
      return {
        title: t.title,
        shortDescription: t.short_description ?? "",
        implementationDescription: t.implementation_description ?? "",
        definitionOfDone: t.definition_of_done ?? "",
        description: t.description ?? "",
        status: t.status,
        priority: t.priority,
        assignedAgentId: t.assigned_agent_id ? String(t.assigned_agent_id) : "",
        humanOwner: t.human_owner ?? "",
        labels: t.labels.join(", "),
        dueDate: toDatetimeLocal(t.due_date),
        storyId: t.story_id ? String(t.story_id) : "",
        isSubmitting: false,
        isDeleting: false,
        error: null,
      };
    }
  }
}

const INITIAL_STATE: FormState = {
  title: "",
  shortDescription: "",
  implementationDescription: "",
  definitionOfDone: "",
  description: "",
  status: "backlog",
  priority: "medium",
  assignedAgentId: "",
  humanOwner: "",
  labels: "",
  dueDate: "",
  storyId: "",
  isSubmitting: false,
  isDeleting: false,
  error: null,
};

export function TaskEditModal({ task, projects, agents, stories, subtasks, onClose, onUpdate, onDelete }: TaskEditModalProps) {
  const [form, dispatch] = useReducer(formReducer, INITIAL_STATE);

  useEffect(() => {
    if (task) dispatch({ type: "LOAD", task });
  }, [task]);

  if (!task) return null;

  const set = (field: keyof FormState, value: string | number | boolean | null) =>
    dispatch({ type: "SET_FIELD", field, value });

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
            if (!form.title.trim()) {
              set("error", "Title is required.");
              return;
            }
            set("isSubmitting", true);
            set("error", null);
            try {
              await onUpdate(task.id, {
                title: form.title.trim(),
                short_description: form.shortDescription.trim(),
                implementation_description: form.implementationDescription.trim(),
                definition_of_done: form.definitionOfDone.trim(),
                description: form.description.trim(),
                status: form.status,
                priority: form.priority,
                assigned_agent_id: form.assignedAgentId ? Number(form.assignedAgentId) : null,
                human_owner: form.humanOwner.trim(),
                labels: form.labels.split(",").map((l) => l.trim()).filter(Boolean),
                due_date: form.dueDate || null,
                story_id: form.storyId ? Number(form.storyId) : null,
                parent_task_id: task.parent_task_id,
                queue_position: task.queue_position,
              });
            } catch (submitError) {
              set("error", submitError instanceof Error ? submitError.message : "Failed to update task");
            } finally {
              set("isSubmitting", false);
            }
          }}
        >
          <label className="field">
            <span>Title</span>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Task title" />
          </label>

          <label className="field">
            <span>Short Description <span className="field__hint">(shown on board card)</span></span>
            <textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="Brief summary visible on the Kanban card" rows={3} />
          </label>

          <label className="field">
            <span>Implementation Description <span className="field__hint">(detailed notes)</span></span>
            <textarea value={form.implementationDescription} onChange={(e) => set("implementationDescription", e.target.value)} placeholder="Technical details, steps, acceptance criteria" rows={5} />
          </label>

          <label className="field">
            <span>Definition of Done</span>
            <textarea value={form.definitionOfDone} onChange={(e) => set("definitionOfDone", e.target.value)} placeholder="Criteria that must be met for this task to be considered complete" rows={3} />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Story</span>
              <select value={form.storyId} onChange={(e) => set("storyId", e.target.value)}>
                <option value="">No story</option>
                {stories.map((story) => (
                  <option key={story.id} value={story.id}>{story.title}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                {["backlog", "architect", "develop", "testing", "done", "failed", "ready", "running", "review"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {["low", "medium", "high", "critical"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Assigned Agent</span>
              <select value={form.assignedAgentId} onChange={(e) => set("assignedAgentId", e.target.value)}>
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Labels</span>
              <input value={form.labels} onChange={(e) => set("labels", e.target.value)} placeholder="ui, backend" />
            </label>
          </div>

          {form.error ? <div className="status-banner status-banner--error">{form.error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={form.isSubmitting}>
              {form.isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {subtasks.length > 0 ? (
          <div className="subtask-section">
            <h3 className="subtask-section__title">Subtasks ({subtasks.length})</h3>
            <ul className="subtask-list">
              {subtasks.map((sub) => (
                <li key={sub.id} className="subtask-item">
                  <span className="subtask-item__status-dot" style={{ background: STATUS_DOT_COLORS[sub.status] ?? "var(--muted)" }} />
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
            disabled={form.isDeleting || form.isSubmitting}
            onClick={async () => {
              set("isDeleting", true);
              try {
                await onDelete(task.id);
              } catch {
                set("error", "Failed to delete task.");
                set("isDeleting", false);
              }
            }}
          >
            {form.isDeleting ? "Deleting\u2026" : "Delete task"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
