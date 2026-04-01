import { useEffect, useMemo, useState } from "react";

import type { AppSection } from "../../app/App";
import { InfoPanel } from "../../components/InfoPanel";
import { TopBar } from "../../components/TopBar";
import { fetchTasks } from "../../lib/api";
import { type TaskApiRecord } from "../../lib/mockData";
import { matchesTaskSearch } from "../../lib/search";

type TasksPageProps = {
  onNavigate: (section: AppSection) => void;
  searchQuery: string;
};

export function TasksPage({ onNavigate, searchQuery }: TasksPageProps) {
  const [tasks, setTasks] = useState<TaskApiRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const records = await fetchTasks();
        if (!cancelled) {
          setTasks(records);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load tasks");
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

  return (
    <section className="dashboard-content">
      <TopBar
        eyebrow="Task Library"
        title="Tasks"
        subtitle="A flat task index across all board lanes."
        primaryActionLabel="Open Dashboard"
        secondaryActionLabel="View Runs"
        onPrimaryAction={() => onNavigate("dashboard")}
        onSecondaryAction={() => onNavigate("runs")}
      />

      <InfoPanel title="Task Index" description="Use this page as the non-kanban list surface for the workspace.">
        {error ? <div className="status-banner status-banner--error">{error}</div> : null}
        {normalizedQuery ? (
          <div className="status-banner">
            Showing {filteredTasks.length} of {tasks.length} tasks for "{searchQuery.trim()}".
          </div>
        ) : null}
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Run</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>{task.priority}</td>
                  <td>{task.status === "running" ? "In progress" : task.status}</td>
                  <td>{new Date(task.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredTasks.length ? <div className="status-banner">No tasks match the current search query.</div> : null}
      </InfoPanel>
    </section>
  );
}
