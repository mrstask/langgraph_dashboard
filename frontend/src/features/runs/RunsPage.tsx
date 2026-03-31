import { useEffect, useState } from "react";

import { TopBar } from "../../components/TopBar";
import { fetchRuns, type RunRecord } from "../../lib/api";

function formatDuration(started: string | null, finished: string | null): string {
  if (!started) return "—";
  const start = new Date(started).getTime();
  const end = finished ? new Date(finished).getTime() : Date.now();
  const seconds = Math.round((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RunStatusChip({ status }: { status: string }) {
  return <span className={`run-status-chip run-status-chip--${status.replace("_", "-")}`}>{status}</span>;
}

export function RunsPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRuns() {
      try {
        const records = await fetchRuns();
        if (!cancelled) {
          setRuns(records);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load runs");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadRuns();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="dashboard-content">
      <TopBar
        eyebrow="Execution History"
        title="Runs"
        subtitle="Orchestration attempts for all agent-assigned tasks, sourced from the database."
      />

      {error ? <div className="status-banner status-banner--error">{error}</div> : null}
      {isLoading ? <div className="status-banner">Loading runs…</div> : null}

      {!isLoading && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Run</th>
                <th>Task</th>
                <th>Agent</th>
                <th>Pipeline</th>
                <th>Status</th>
                <th>Started</th>
                <th>Duration</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="data-table__empty">
                    No runs recorded yet.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id}>
                    <td className="data-table__mono">{`RUN-${String(run.id).padStart(3, "0")}`}</td>
                    <td className="data-table__mono">{`#${run.task_id}`}</td>
                    <td className="data-table__mono">{`A${run.agent_id}`}</td>
                    <td>{run.pipeline_type}</td>
                    <td>
                      <RunStatusChip status={run.status} />
                    </td>
                    <td className="data-table__muted">{formatTime(run.started_at)}</td>
                    <td className="data-table__muted">{formatDuration(run.started_at, run.finished_at)}</td>
                    <td className="data-table__summary">
                      {run.error_message ? (
                        <span className="data-table__error">{run.error_message}</span>
                      ) : (
                        run.output_summary ?? "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
