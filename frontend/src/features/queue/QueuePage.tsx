import { useCallback, useEffect, useState } from "react";

import { TopBar } from "../../components/TopBar";
import { fetchQueue, type QueueGroup } from "../../lib/api";
import { useVisibilityPolling } from "../../lib/useVisibilityPolling";

const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  ready: "Ready",
  architect: "Architect",
  develop: "Develop",
  testing: "Testing",
  review: "Review",
  done: "Done",
  failed: "Failed",
  running: "Running",
};

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`task-status-badge task-status-badge--${status}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="queue-progress">
      <div className="queue-progress__bar" style={{ width: `${pct}%` }} />
      <span className="queue-progress__label">{done}/{total}</span>
    </div>
  );
}

function SubtaskRow({ task, position }: { task: QueueGroup["subtasks"][number]; position: number }) {
  const isDone = task.status === "done";
  const isFailed = task.status === "failed";
  return (
    <div className={`queue-subtask${isDone ? " queue-subtask--done" : ""}${isFailed ? " queue-subtask--failed" : ""}`}>
      <span className="queue-subtask__pos">{position + 1}</span>
      <div className="queue-subtask__body">
        <span className="queue-subtask__title">{task.title}</span>
        {task.labels.length > 0 && (
          <div className="queue-subtask__labels">
            {task.labels.map((l) => (
              <span key={l} className="task-label">{l}</span>
            ))}
          </div>
        )}
      </div>
      <StatusBadge status={task.status} />
    </div>
  );
}

function QueueGroupCard({ group }: { group: QueueGroup }) {
  const [collapsed, setCollapsed] = useState(false);
  const allDone = group.done === group.total;

  return (
    <div className={`queue-group${allDone ? " queue-group--done" : ""}`}>
      <div className="queue-group__header" onClick={() => setCollapsed((c) => !c)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setCollapsed((c) => !c)}>
        <div className="queue-group__meta">
          <span className="queue-group__chevron">{collapsed ? "›" : "∨"}</span>
          <div>
            <div className="queue-group__title">#{group.parent.id} {group.parent.title}</div>
            <div className="queue-group__subtitle">
              <StatusBadge status={group.parent.status} />
              <span className="queue-group__priority">{group.parent.priority}</span>
            </div>
          </div>
        </div>
        <ProgressBar done={group.done} total={group.total} />
      </div>

      {!collapsed && (
        <div className="queue-group__subtasks">
          {group.subtasks.map((st, i) => (
            <SubtaskRow key={st.id} task={st} position={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export function QueuePage() {
  const [groups, setGroups] = useState<QueueGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchQueue();
      setGroups(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useVisibilityPolling(load, 10_000);

  const active = groups.filter((g) => g.done < g.total);
  const completed = groups.filter((g) => g.done === g.total);

  return (
    <div className="page-root">
      <TopBar title="Queue" subtitle={`${active.length} active batch${active.length !== 1 ? "es" : ""}, ${completed.length} completed`} />

      <div className="queue-page">
        {isLoading && <p className="queue-empty">Loading…</p>}
        {!isLoading && error && <p className="queue-error">{error}</p>}
        {!isLoading && !error && groups.length === 0 && (
          <p className="queue-empty">No queued tasks. Architect will populate this when tasks are split into subtasks.</p>
        )}

        {active.length > 0 && (
          <section>
            <h2 className="queue-section-title">Active</h2>
            {active.map((g) => <QueueGroupCard key={g.parent.id} group={g} />)}
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <h2 className="queue-section-title queue-section-title--muted">Completed</h2>
            {completed.map((g) => <QueueGroupCard key={g.parent.id} group={g} />)}
          </section>
        )}
      </div>
    </div>
  );
}
