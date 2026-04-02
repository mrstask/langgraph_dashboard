import { useCallback, useEffect, useMemo, useState } from "react";

import { TopBar } from "../../components/TopBar";
import { fetchAgents, fetchRuns, fetchTasks, type AgentRecord, type RunRecord } from "../../lib/api";
import { formatDuration, formatTime } from "../../lib/format";
import { useVisibilityPolling } from "../../lib/useVisibilityPolling";
import { RunDetailPanel } from "./RunDetailPanel";

function RunStatusChip({ status }: { status: string }) {
  return <span className={`run-status-chip run-status-chip--${status.replace("_", "-")}`}>{status}</span>;
}

export function RunsPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [tasksMap, setTasksMap] = useState<Map<number, string>>(new Map());
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const [runRecords, agentRecords, taskRecords] = await Promise.all([
          fetchRuns(),
          fetchAgents(),
          fetchTasks(),
        ]);
        if (!cancelled) {
          setRuns(runRecords);
          setAgents(agentRecords);
          setTasksMap(new Map(taskRecords.map((t) => [t.id, t.title])));
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

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const pollRuns = useCallback(() => {
    fetchRuns()
      .then((records) => setRuns(records))
      .catch(() => {});
  }, []);

  const hasRunning = runs.some((r) => r.status === "running" || r.status === "in_progress");
  useVisibilityPolling(pollRuns, hasRunning ? 5_000 : 30_000);

  const agentsMap = useMemo(() => new Map(agents.map((a) => [a.id, a.name])), [agents]);

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
                  <tr
                    key={run.id}
                    className="data-table__row--clickable"
                    onClick={() => setSelectedRun(run)}
                  >
                    <td className="data-table__mono">{`RUN-${String(run.id).padStart(3, "0")}`}</td>
                    <td className="data-table__mono" title={tasksMap.get(run.task_id)}>
                      {tasksMap.get(run.task_id) ?? `#${run.task_id}`}
                    </td>
                    <td className="data-table__mono">
                      {run.agent_id != null ? (agentsMap.get(run.agent_id) ?? `A${run.agent_id}`) : "—"}
                    </td>
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

      {selectedRun ? (
        <RunDetailPanel
          run={selectedRun}
          agentsMap={agentsMap}
          tasksMap={tasksMap}
          onClose={() => setSelectedRun(null)}
        />
      ) : null}
    </section>
  );
}
