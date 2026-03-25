import { useEffect, useState } from "react";

import { InfoPanel } from "../../components/InfoPanel";
import { TopBar } from "../../components/TopBar";
import { fetchRuns, type RunRecord } from "../../lib/api";

export function RunsPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
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
        subtitle="Recent orchestration attempts for agent-assigned tasks."
      />

      <InfoPanel title="Recent Runs" description="This page will later be backed by task run records from SQLite.">
        {error ? <div className="status-banner status-banner--error">{error}</div> : null}
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Task</th>
                <th>Status</th>
                <th>Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>{`RUN-${String(run.id).padStart(3, "0")}`}</td>
                  <td>{`Task #${run.task_id}`}</td>
                  <td>{run.status}</td>
                  <td>{run.pipeline_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoPanel>
    </section>
  );
}
