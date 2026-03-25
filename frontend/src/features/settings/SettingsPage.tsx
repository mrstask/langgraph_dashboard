import { InfoPanel } from "../../components/InfoPanel";
import { TopBar } from "../../components/TopBar";

export function SettingsPage() {
  return (
    <section className="dashboard-content">
      <TopBar
        eyebrow="Workspace Settings"
        title="Settings"
        subtitle="This placeholder page will later expose runtime defaults and pipeline configuration."
      />

      <InfoPanel
        title="Runtime Mode"
        description="The workspace currently uses a mock orchestration backend while the persistence layer is being completed."
      >
        <div className="detail-list">
          <div>
            <span>Current runtime</span>
            <strong>MockAgentOrchestrator</strong>
          </div>
          <div>
            <span>Future adapters</span>
            <strong>LangChain, LangGraph</strong>
          </div>
        </div>
      </InfoPanel>
    </section>
  );
}
