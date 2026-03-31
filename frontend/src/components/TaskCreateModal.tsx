import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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

type StoryOption = {
  id: number;
  title: string;
};

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

const defaultPriority: TaskApiRecord["priority"] = "medium";

export function TaskCreateModal({
  isOpen,
  defaultStatus,
  projects,
  agents,
  stories,
  onClose,
  onCreate,
}: TaskCreateModalProps) {
  const [projectId, setProjectId] = useState<number>(projects[0]?.id ?? 1);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [implementationDescription, setImplementationDescription] = useState("");
  const [definitionOfDone, setDefinitionOfDone] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<BoardColumnId>(defaultStatus);
  const [priority, setPriority] = useState<TaskApiRecord["priority"]>(defaultPriority);
  const [assignedAgentId, setAssignedAgentId] = useState<string>("");
  const [humanOwner, setHumanOwner] = useState("Stanislav");
  const [labels, setLabels] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [storyId, setStoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setProjectId(projects[0]?.id ?? 1);
    setTitle("");
    setShortDescription("");
    setImplementationDescription("");
    setDefinitionOfDone("");
    setDescription("");
    setStatus(defaultStatus);
    setPriority(defaultPriority);
    setAssignedAgentId("");
    setHumanOwner("Stanislav");
    setLabels("");
    setDueDate("");
    setStoryId("");
    setError(null);
    setIsSubmitting(false);
  }, [defaultStatus, isOpen, projects]);

  if (!isOpen) {
    return null;
  }

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
                  .map((label) => label.trim())
                  .filter(Boolean),
                due_date: dueDate || null,
                story_id: storyId ? Number(storyId) : null,
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
            <span>Short Description <span className="field__hint">(shown on board card)</span></span>
            <textarea
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              placeholder="Brief summary visible on the Kanban card"
              rows={3}
            />
          </label>

          <label className="field">
            <span>Implementation Description <span className="field__hint">(detailed notes)</span></span>
            <textarea
              value={implementationDescription}
              onChange={(event) => setImplementationDescription(event.target.value)}
              placeholder="Technical details, steps, acceptance criteria"
              rows={5}
            />
          </label>

          <label className="field">
            <span>Definition of Done</span>
            <textarea
              value={definitionOfDone}
              onChange={(event) => setDefinitionOfDone(event.target.value)}
              placeholder="Criteria that must be met for this task to be considered complete"
              rows={3}
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Story</span>
              <select value={storyId} onChange={(event) => setStoryId(event.target.value)}>
                <option value="">No story</option>
                {stories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </label>

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
                {["backlog", "architect", "develop", "testing", "done", "failed", "ready", "running", "review"].map((value) => (
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
    </div>,
    document.body,
  );
}
