import { useEffect, useReducer } from "react";
import { createPortal } from "react-dom";

import type { BoardColumnId, TaskApiRecord } from "../lib/mockData";

type ProjectOption = { id: number; key: string; name: string };
type AgentOption = { id: number; name: string };
type StoryOption = { id: number; title: string };

type TaskCreateModalProps = {
  isOpen: boolean;
  defaultStatus: BoardColumnId;
  projects: ProjectOption[];
  agents: AgentOption[];
  stories: StoryOption[];
  onClose: () => void;
  onCreate: (payload: TaskCreateFormValue) => Promise<void>;
};

export type TaskCreateFormValue = {
  project_id: number;
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

type FormState = {
  projectId: number;
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
  error: string | null;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string | number | boolean | null }
  | { type: "RESET"; defaultProjectId: number; defaultStatus: BoardColumnId };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return {
        projectId: action.defaultProjectId,
        title: "",
        shortDescription: "",
        implementationDescription: "",
        definitionOfDone: "",
        description: "",
        status: action.defaultStatus,
        priority: "medium",
        assignedAgentId: "",
        humanOwner: "Stanislav",
        labels: "",
        dueDate: "",
        storyId: "",
        isSubmitting: false,
        error: null,
      };
  }
}

export function TaskCreateModal({
  isOpen,
  defaultStatus,
  projects,
  agents,
  stories,
  onClose,
  onCreate,
}: TaskCreateModalProps) {
  const [form, dispatch] = useReducer(formReducer, {
    projectId: projects[0]?.id ?? 1,
    title: "",
    shortDescription: "",
    implementationDescription: "",
    definitionOfDone: "",
    description: "",
    status: defaultStatus,
    priority: "medium",
    assignedAgentId: "",
    humanOwner: "Stanislav",
    labels: "",
    dueDate: "",
    storyId: "",
    isSubmitting: false,
    error: null,
  });

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "RESET", defaultProjectId: projects[0]?.id ?? 1, defaultStatus });
    }
  }, [defaultStatus, isOpen, projects]);

  if (!isOpen) return null;

  const set = (field: keyof FormState, value: string | number | boolean | null) =>
    dispatch({ type: "SET_FIELD", field, value });

  return createPortal(
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
            if (!form.title.trim()) {
              set("error", "Title is required.");
              return;
            }
            set("isSubmitting", true);
            set("error", null);
            try {
              await onCreate({
                project_id: form.projectId,
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
              });
            } catch (submitError) {
              set("error", submitError instanceof Error ? submitError.message : "Failed to create task");
            } finally {
              set("isSubmitting", false);
            }
          }}
        >
          <label className="field">
            <span>Title</span>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Write task title" />
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
              <span>Project</span>
              <select value={form.projectId} onChange={(e) => set("projectId", Number(e.target.value))}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.key} · {project.name}</option>
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
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Priority</span>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {["low", "medium", "high", "critical"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Assigned Agent</span>
              <select value={form.assignedAgentId} onChange={(e) => set("assignedAgentId", e.target.value)}>
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Owner</span>
              <input value={form.humanOwner} onChange={(e) => set("humanOwner", e.target.value)} />
            </label>

            <label className="field">
              <span>Due Date</span>
              <input type="datetime-local" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </label>
          </div>

          <label className="field">
            <span>Labels</span>
            <input value={form.labels} onChange={(e) => set("labels", e.target.value)} placeholder="ui, backend" />
          </label>

          {form.error ? <div className="status-banner status-banner--error">{form.error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={form.isSubmitting}>
              {form.isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
