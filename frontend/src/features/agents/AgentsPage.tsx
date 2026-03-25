import { useEffect, useState } from "react";

import { AgentCreateModal, type AgentCreateFormValue } from "../../components/AgentCreateModal";
import type { AppSection } from "../../app/App";
import { InfoPanel } from "../../components/InfoPanel";
import { TopBar } from "../../components/TopBar";
import { createAgent, fetchAgents, type AgentRecord } from "../../lib/api";

type AgentsPageProps = {
  onNavigate: (section: AppSection) => void;
};

export function AgentsPage({ onNavigate }: AgentsPageProps) {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAgents() {
      try {
        const records = await fetchAgents();
        if (!cancelled) {
          setAgents(records);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load agents");
        }
      }
    }

    void loadAgents();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateAgent = async (payload: AgentCreateFormValue) => {
    const createdAgent = await createAgent(payload);
    setAgents((currentAgents) => [createdAgent, ...currentAgents]);
    setIsCreateOpen(false);
    setError(null);
  };

  return (
    <section className="dashboard-content">
      <TopBar
        eyebrow="Agent Registry"
        title="Agents"
        subtitle="Current runtime identities and their active capabilities."
        primaryActionLabel="Create Agent"
        secondaryActionLabel="View Runs"
        onPrimaryAction={() => setIsCreateOpen(true)}
        onSecondaryAction={() => onNavigate("runs")}
      />

      {error ? <div className="status-banner status-banner--error">{error}</div> : null}

      <div className="panel-grid">
        {agents.map((agent) => (
          <InfoPanel
            key={agent.id}
            title={agent.name}
            description={`${agent.agent_type ?? "mock"} pipeline with ${agent.status ?? "unknown"} status.`}
          >
            <div className="detail-list">
              <div>
                <span>Status</span>
                <strong>{agent.status ?? "unknown"}</strong>
              </div>
              <div>
                <span>Slug</span>
                <strong>{agent.slug ?? "n/a"}</strong>
              </div>
              <div>
                <span>Capabilities</span>
                <strong>{agent.capabilities?.join(", ") || "No capabilities defined"}</strong>
              </div>
            </div>
          </InfoPanel>
        ))}
      </div>

      <AgentCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateAgent} />
    </section>
  );
}
