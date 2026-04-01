import type { DashboardTask } from "../lib/mockData";

type TaskCardProps = {
  task: DashboardTask;
  isDragging?: boolean;
  onDragStart?: (taskId: number) => void;
  onDragEnd?: () => void;
  onClick?: (taskId: number) => void;
  onKeyboardMove?: (taskId: number, direction: "left" | "right") => void;
};

export function TaskCard({
  task,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onClick,
  onKeyboardMove,
}: TaskCardProps) {
  return (
    <article
      className={`task-card ${isDragging ? "task-card--dragging" : ""}`}
      draggable
      tabIndex={0}
      role="button"
      aria-roledescription="draggable task"
      aria-label={`${task.title}, ${task.priority} priority. Use Ctrl+Left or Ctrl+Right to move between columns.`}
      onDragStart={() => onDragStart?.(task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(task.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onClick?.(task.id);
          }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "ArrowLeft") {
          e.preventDefault();
          onKeyboardMove?.(task.id, "left");
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "ArrowRight") {
          e.preventDefault();
          onKeyboardMove?.(task.id, "right");
        }
      }}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      <div className="task-card__chips">
        <span className={`priority-chip priority-chip--${task.priority}`}>{task.priority}</span>
        {task.storyTitle ? (
          <span className="story-chip" title={task.storyTitle}>{task.storyTitle}</span>
        ) : null}
        {task.actionLabel === "todo" ? (
          <span className="action-chip action-chip--todo">todo</span>
        ) : task.actionLabel === "review" ? (
          <span className="action-chip action-chip--review">review</span>
        ) : null}
        {task.hasMaxRetriesError ? (
          <span className="retry-chip retry-chip--max">max retries</span>
        ) : task.retryCount > 0 ? (
          <span className="retry-chip">retry {task.retryCount}</span>
        ) : null}
        {task.isSubtask ? <span className="subtask-chip">subtask</span> : null}
      </div>
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
