import type { DashboardTask } from "../lib/mockData";

type TaskCardProps = {
  task: DashboardTask;
  isDragging?: boolean;
  onDragStart?: (taskId: number) => void;
  onDragEnd?: () => void;
};

export function TaskCard({
  task,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  return (
    <article
      className={`task-card ${isDragging ? "task-card--dragging" : ""}`}
      draggable
      onDragStart={() => onDragStart?.(task.id)}
      onDragEnd={onDragEnd}
    >
      <span className={`priority-chip priority-chip--${task.priority}`}>{task.priority}</span>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="task-meta">
        <div className="avatar-stack">
          <span className="mini-avatar">{task.agentInitials}</span>
          <span className="mini-avatar mini-avatar--ghost">{task.ownerInitials}</span>
        </div>
        <div className="task-stats">
          <span>{task.runStatus}</span>
          <span>{task.updatedAt}</span>
        </div>
      </div>
    </article>
  );
}
