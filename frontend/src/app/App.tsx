import { useEffect, useState } from "react";

import { Sidebar } from "../components/Sidebar";
import { AgentsPage } from "../features/agents/AgentsPage";
import { ProjectsPage } from "../features/projects/ProjectsPage";
import { RunsPage } from "../features/runs/RunsPage";
import { DashboardPage } from "../features/tasks/DashboardPage";
import { TasksPage } from "../features/tasks/TasksPage";
import { SettingsPage } from "../features/settings/SettingsPage";

export type AppSection = "dashboard" | "tasks" | "agents" | "runs" | "projects" | "settings";

const defaultSection: AppSection = "dashboard";

function getSectionFromHash(hash: string): AppSection {
  const section = hash.replace(/^#/, "").toLowerCase();
  switch (section) {
    case "dashboard":
    case "tasks":
    case "agents":
    case "runs":
    case "projects":
    case "settings":
      return section;
    default:
      return defaultSection;
  }
}

export function App() {
  const [section, setSection] = useState<AppSection>(() => getSectionFromHash(window.location.hash));
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setSection(getSectionFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (nextSection: AppSection) => {
    window.location.hash = nextSection;
    setSection(nextSection);
  };

  return (
    <main className="dashboard-bg">
      <div className={`dashboard-shell${isSidebarCollapsed ? " dashboard-shell--sidebar-collapsed" : ""}`}>
        <Sidebar
          activeSection={section}
          searchQuery={searchQuery}
          isCollapsed={isSidebarCollapsed}
          onNavigate={navigate}
          onSearchChange={setSearchQuery}
          onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        />
        {section === "dashboard" ? <DashboardPage onNavigate={navigate} searchQuery={searchQuery} /> : null}
        {section === "tasks" ? <TasksPage onNavigate={navigate} searchQuery={searchQuery} /> : null}
        {section === "agents" ? <AgentsPage onNavigate={navigate} /> : null}
        {section === "runs" ? <RunsPage /> : null}
        {section === "projects" ? <ProjectsPage onNavigate={navigate} /> : null}
        {section === "settings" ? <SettingsPage /> : null}
      </div>
    </main>
  );
}
