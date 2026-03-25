import { useEffect, useMemo, useState } from "react";

import type { AppSection } from "../../app/App";
import { BoardColumn } from "../../components/BoardColumn";
import { TaskCard } from "../../components/TaskCard";
import { TaskCreateModal, type TaskCreateFormValue } from "../../components/TaskCreateModal";
import { TopBar } from "../../components/TopBar";
import { createTask, fetchAgents, fetchProjects, fetchTasks, moveTask } from "../../lib/api";
import {
  buildBoardColumns,
  buildSummaryStats,
  type BoardColumnData,
  type BoardColumnId,
  type TaskApiRecord,
} from "../../lib/mockData";

type DashboardPageProps = {
  onNavigate: (section: AppSection) => void;
  searchQuery: string;
};

function matchesTaskSearch(task: TaskApiRecord, normalizedQuery: string) {
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

export function DashboardPage({ onNavigate, searchQuery }: DashboardPageProps) {
  const [tasks, setTasks] = useState<TaskApiRecord[]>([]);
  const [projects, setProjects] = useState<Array<{ id: number; key: string; name: string }>>([]);
  const [agents, setAgents] = useState<Array<{ id: number; name: string }>>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<BoardColumnId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<BoardColumnId>("backlog");

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const [taskRecords, projectRecords, agentRecords] = await Promise.all([
          fetchTasks(),
          fetchProjects(),
          fetchAgents(),
        ]);
        if (!cancelled) {
          setTasks(taskRecords);
          setProjects(projectRecords);
          setAgents(agentRecords);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load tasks");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTasks = useMemo(
    () => tasks.filter((task) => matchesTaskSearch(task, normalizedQuery)),
    [normalizedQuery, tasks],
  );
  const columns = useMemo(() => buildBoardColumns(filteredTasks), [filteredTasks]);
  const summaryStats = useMemo(() => buildSummaryStats(columns), [columns]);
  const summaryStatsWithAgents = useMemo(
    () =>
      summaryStats.map((item) =>
        item.label === "Agents Online"
          ? {
              ...item,
              value: String(agents.length),
              detail: `${agents.filter((agent) => agent.name).length} agents registered in the workspace`,
            }
          : item,
      ),
    [agents.length, summaryStats],
  );

  const handleDragStart = (taskId: number) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDropTargetColumnId(null);
  };

  const handleDropTask = async (targetColumnId: BoardColumnId) => {
    if (draggedTaskId === null) {
      return;
    }

    const task = tasks.find((currentTask) => currentTask.id === draggedTaskId);
    if (!task || task.status === targetColumnId) {
      setDraggedTaskId(null);
      setDropTargetColumnId(null);
      return;
    }

    try {
      const updatedTask = await moveTask(draggedTaskId, targetColumnId);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) => (currentTask.id === updatedTask.id ? updatedTask : currentTask)),
      );
      setError(null);
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Failed to move task");
    } finally {
      setDraggedTaskId(null);
      setDropTargetColumnId(null);
    }
  };

  const openCreateModal = (status: BoardColumnId) => {
    setCreateDefaultStatus(status);
    setIsCreateOpen(true);
  };

  const handleCreateTask = async (payload: TaskCreateFormValue) => {
    const createdTask = await createTask({
      ...payload,
      due_date: payload.due_date ? new Date(payload.due_date).toISOString() : null,
    });
    setTasks((currentTasks) => [createdTask, ...currentTasks]);
    setIsCreateOpen(false);
    setError(null);
  };

  return (
    <section className="dashboard-content">
      <TopBar
        title="Kanban Dashboard"
        subtitle="Track backlog, execution, review, and failures across agent lanes."
        onPrimaryAction={() => openCreateModal("backlog")}
        onSecondaryAction={() => onNavigate("agents")}
      />

      {error ? <div className="status-banner status-banner--error">{error}</div> : null}
      {isLoading ? <div className="status-banner">Loading tasks from backend...</div> : null}
      {!isLoading && normalizedQuery ? (
        <div className="status-banner">
          Showing {filteredTasks.length} of {tasks.length} tasks for "{searchQuery.trim()}".
        </div>
      ) : null}

      <div className="summary-grid">
        {summaryStatsWithAgents.map((item) => (
          <article key={item.label} className="summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="board-grid">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            id={column.id}
            title={column.title}
            count={column.tasks.length}
            tone={column.tone}
            onCreateTask={openCreateModal}
            isActiveDropTarget={dropTargetColumnId === column.id}
            onDragOver={setDropTargetColumnId}
            onDropTask={(columnId) => {
              void handleDropTask(columnId);
            }}
          >
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isDragging={draggedTaskId === task.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </BoardColumn>
        ))}
      </div>
      {!isLoading && filteredTasks.length === 0 ? (
        <div className="status-banner">No tasks match the current search query.</div>
      ) : null}

      <TaskCreateModal
        isOpen={isCreateOpen}
        defaultStatus={createDefaultStatus}
        projects={projects}
        agents={agents}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateTask}
      />
    </section>
  );
}
