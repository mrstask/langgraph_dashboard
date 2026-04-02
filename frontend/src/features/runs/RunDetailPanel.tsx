import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { fetchRun, type RunRecord } from "../../lib/api";
import { formatDuration, formatTimeWithSeconds } from "../../lib/format";

type RunDetailPanelProps = {
  run: RunRecord;
  agentsMap: Map<number, string>;
  tasksMap: Map<number, string>;
  onClose: () => void;
};

const LIVE_STATUSES = new Set(["running", "in_progress", "in-progress"]);

function RunStatusChip({ status }: { status: string }) {
  return <span className={`run-status-chip run-status-chip--${status.replace("_", "-")}`}>{status}</span>;
}

export function RunDetailPanel({ run: initialRun, agentsMap, tasksMap, onClose }: RunDetailPanelProps) {
  const [run, setRun] = useState<RunRecord>(initialRun);
  const logsRef = useRef<HTMLPreElement>(null);
  const isLive = LIVE_STATUSES.has(run.status);

  // Reset when a different run is selected
  useEffect(() => {
    setRun(initialRun);
  }, [initialRun.id]);

  // Poll every 2s while run is active
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      fetchRun(run.id).then(setRun).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [run.id, isLive]);

  // Auto-scroll logs to bottom whenever logs_text grows
  useEffect(() => {
    const el = logsRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom || isLive) {
      el.scrollTop = el.scrollHeight;
    }
  }, [run.logs_text, isLive]);

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
            {isLive && <span className="run-live-badge">● LIVE</span>}
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

        {run.logs_text || isLive ? (
          <div className="run-detail__section">
            <p className="run-detail__section-label">
              Logs
              {isLive && <span className="run-detail__logs-live-dot" />}
            </p>
            <pre ref={logsRef} className="run-detail__logs">
              {run.logs_text ?? "Waiting for output…"}
            </pre>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
