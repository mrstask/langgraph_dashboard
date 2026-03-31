import { useEffect, useMemo, useState } from "react";

import type { AppSection } from "../../app/App";
import { StoryEditModal } from "../../components/StoryEditModal";
import { TaskEditModal, type TaskEditFormValue } from "../../components/TaskEditModal";
import { TopBar } from "../../components/TopBar";
import { deleteTask, fetchAgents, fetchProjects, fetchStories, fetchTasks, updateStory, updateTask } from "../../lib/api";
import type { StoryRecord } from "../../lib/api";
import type { BoardColumnId, TaskApiRecord } from "../../lib/mockData";

type StoriesPageProps = {
  onNavigate: (section: AppSection) => void;
};

const STATUS_ORDER: BoardColumnId[] = ["backlog", "architect", "develop", "testing", "done", "failed", "ready", "running", "review"];

const STATUS_COLORS: Record<BoardColumnId, string> = {
  backlog: "var(--slate)",
  architect: "var(--violet)",
  develop: "var(--blue)",
  testing: "var(--amber)",
  done: "var(--green)",
  failed: "var(--red)",
  ready: "var(--blue)",
  running: "var(--violet)",
  review: "var(--amber)",
};

function StatusBadge({ status }: { status: BoardColumnId }) {
  return (
    <span
      className="story-task-status"
      style={{ background: STATUS_COLORS[status], color: "#fff" }}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskApiRecord["priority"] }) {
  return (
    <span className={`priority-chip priority-chip--${priority}`}>{priority}</span>
  );
}

type StoryPanelProps = {
  story: StoryRecord | null;
  tasks: TaskApiRecord[];
  defaultOpen: boolean;
  onClickTask: (task: TaskApiRecord) => void;
  onEditStory?: (story: StoryRecord) => void;
};

function StoryPanel({ story, tasks, defaultOpen, onClickTask, onEditStory }: StoryPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const countsByStatus = useMemo(() => {
    const counts: Partial<Record<BoardColumnId, number>> = {};
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    }
    return counts;
  }, [tasks]);

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const ai = STATUS_ORDER.indexOf(a.status);
        const bi = STATUS_ORDER.indexOf(b.status);
        return ai !== bi ? ai - bi : a.id - b.id;
      }),
    [tasks],
  );

  return (
    <div className={`story-panel${isOpen ? " story-panel--open" : ""}`}>
      <button
        type="button"
        className="story-panel__header"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <div className="story-panel__header-left">
          <span className="story-panel__chevron">{isOpen ? "▾" : "▸"}</span>
          <div>
            <span className="story-panel__title">
              {story ? story.title : "Unassigned"}
            </span>
            {story?.description ? (
              <span className="story-panel__desc">{story.description}</span>
            ) : null}
          </div>
        </div>
        <div className="story-panel__header-right">
          {STATUS_ORDER.map((status) =>
            countsByStatus[status] ? (
              <span
                key={status}
                className="story-status-count"
                style={{ background: `${STATUS_COLORS[status]}22`, color: STATUS_COLORS[status] }}
                title={`${countsByStatus[status]} ${status}`}
              >
                {countsByStatus[status]} {status}
              </span>
            ) : null,
          )}
          <span className="story-panel__total">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
          {story && onEditStory ? (
            <button
              type="button"
              className="story-edit-btn"
              title="Edit story"
              onClick={(e) => { e.stopPropagation(); onEditStory(story); }}
            >
              ✎
            </button>
          ) : null}
        </div>
      </button>

      {isOpen ? (
        <div className="story-panel__body">
          {sortedTasks.length === 0 ? (
            <p className="story-panel__empty">No tasks in this story.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Labels</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="story-task-row"
                    onClick={() => onClickTask(task)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <span className="story-task-title">{task.title}</span>
                      {task.definition_of_done ? (
                        <span className="story-task-dod" title={task.definition_of_done}>
                          DoD
                        </span>
                      ) : null}
                    </td>
                    <td><StatusBadge status={task.status} /></td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td>
                      <div className="story-task-labels">
                        {task.labels.map((label) => (
                          <span key={label} className="story-label-chip">{label}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function StoriesPage({ onNavigate }: StoriesPageProps) {
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [tasks, setTasks] = useState<TaskApiRecord[]>([]);
  const [projects, setProjects] = useState<Array<{ id: number; key: string; name: string }>>([]);
  const [agents, setAgents] = useState<Array<{ id: number; name: string }>>([]);
  const [editingTask, setEditingTask] = useState<TaskApiRecord | null>(null);
  const [editingStory, setEditingStory] = useState<StoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [storyRecords, taskRecords, projectRecords, agentRecords] = await Promise.all([
          fetchStories(),
          fetchTasks(),
          fetchProjects(),
          fetchAgents(),
        ]);
        if (!cancelled) {
          setStories(storyRecords);
          setTasks(taskRecords);
          setProjects(projectRecords);
          setAgents(agentRecords);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const tasksByStory = useMemo(() => {
    const map = new Map<number | null, TaskApiRecord[]>();
    map.set(null, []);
    for (const s of stories) map.set(s.id, []);
    for (const t of tasks) {
      const key = t.story_id ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [stories, tasks]);

  const handleUpdateStory = async (storyId: number, title: string, description: string) => {
    const updated = await updateStory(storyId, { title, description });
    setStories((current) => current.map((s) => (s.id === updated.id ? updated : s)));
    setEditingStory(null);
  };

  const handleUpdateTask = async (taskId: number, payload: TaskEditFormValue) => {
    const updated = await updateTask(taskId, payload);
    setTasks((current) => current.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
    setTasks((current) => current.filter((t) => t.id !== taskId));
    setEditingTask(null);
  };

  return (
    <section className="dashboard-content">
      <TopBar
        title="Stories"
        subtitle="Tasks grouped by story — each story maps to a testable feature slice."
        projects={projects}
        selectedProjectId={null}
        onProjectChange={() => {}}
        onPrimaryAction={() => onNavigate("dashboard")}
        primaryActionLabel="Open Board"
      />

      {error ? <div className="status-banner status-banner--error">{error}</div> : null}
      {isLoading ? <div className="status-banner">Loading stories…</div> : null}

      {!isLoading ? (
        <div className="stories-list">
          {stories.map((story) => (
            <StoryPanel
              key={story.id}
              story={story}
              tasks={tasksByStory.get(story.id) ?? []}
              defaultOpen={false}
              onClickTask={setEditingTask}
              onEditStory={setEditingStory}
            />
          ))}
          {(tasksByStory.get(null)?.length ?? 0) > 0 ? (
            <StoryPanel
              key="unassigned"
              story={null}
              tasks={tasksByStory.get(null) ?? []}
              defaultOpen={false}
              onClickTask={setEditingTask}
            />
          ) : null}
        </div>
      ) : null}

      <StoryEditModal
        story={editingStory}
        onClose={() => setEditingStory(null)}
        onUpdate={handleUpdateStory}
      />

      <TaskEditModal
        task={editingTask}
        projects={projects}
        agents={agents}
        stories={stories}
        subtasks={[]}
        onClose={() => setEditingTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </section>
  );
}
