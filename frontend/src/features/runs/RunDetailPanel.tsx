import { createPortal } from "react-dom";

import type { RunRecord } from "../../lib/api";
import { formatDuration, formatTimeWithSeconds } from "../../lib/format";

type RunDetailPanelProps = {
  run: RunRecord;
  agentsMap: Map<number, string>;
  tasksMap: Map<number, string>;
  onClose: () => void;
};

function RunStatusChip({ status }: { status: string }) {
  return <span className={`run-status-chip run-status-chip--${status.replace("_", "-")}`}>{status}</span>;
}

export function RunDetailPanel({ run, agentsMap, tasksMap, onClose }: RunDetailPanelProps) {
  const agentName = run.agent_id != null ? (agentsMap.get(run.agent_id) ?? `Agent #${run.agent_id}`) : "—";
  const taskTitle = tasksMap.get(run.task_id) ?? `Task #${run.task_id}`;

  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card run-detail-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{run.pipeline_type}</p>
            <h2>{`RUN-${String(run.id).padStart(3, "0")}`}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <RunStatusChip status={run.status} />
            <button type="button" className="icon-button icon-button--dark" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </div>

        <div className="run-detail__meta">
          <div className="run-detail__meta-row">
            <span>Task</span>
            <strong>{taskTitle}</strong>
          </div>
          <div className="run-detail__meta-row">
            <span>Agent</span>
            <strong>{agentName}</strong>
          </div>
          <div className="run-detail__meta-row">
            <span>Started</span>
            <strong>{formatTimeWithSeconds(run.started_at)}</strong>
          </div>
          <div className="run-detail__meta-row">
            <span>Finished</span>
            <strong>{formatTimeWithSeconds(run.finished_at)}</strong>
          </div>
          <div className="run-detail__meta-row">
            <span>Duration</span>
            <strong>{formatDuration(run.started_at, run.finished_at)}</strong>
          </div>
        </div>

        {run.output_summary ? (
          <div className="run-detail__section">
            <p className="run-detail__section-label">Summary</p>
            <p className="run-detail__summary">{run.output_summary}</p>
          </div>
        ) : null}

        {run.error_message ? (
          <div className="run-detail__section">
            <p className="run-detail__section-label">Error</p>
            <p className="run-detail__error">{run.error_message}</p>
          </div>
        ) : null}

        {run.logs_text ? (
          <div className="run-detail__section">
            <p className="run-detail__section-label">Logs</p>
            <pre className="run-detail__logs">{run.logs_text}</pre>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
