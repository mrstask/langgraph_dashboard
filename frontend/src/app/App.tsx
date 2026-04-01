import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import { Sidebar } from "../components/Sidebar";
import { fetchCounts } from "../lib/api";
import { useTheme } from "../lib/useTheme";
import { AgentsPage } from "../features/agents/AgentsPage";
import { ProjectsPage } from "../features/projects/ProjectsPage";
import { RunsPage } from "../features/runs/RunsPage";
import { StoriesPage } from "../features/stories/StoriesPage";
import { DashboardPage } from "../features/tasks/DashboardPage";
import { TasksPage } from "../features/tasks/TasksPage";
import { SettingsPage } from "../features/settings/SettingsPage";

export type AppSection = "dashboard" | "tasks" | "stories" | "agents" | "runs" | "projects" | "settings";

const SECTIONS: AppSection[] = ["dashboard", "tasks", "stories", "agents", "runs", "projects", "settings"];

function sectionFromPath(pathname: string): AppSection {
  const segment = pathname.replace(/^\//, "").toLowerCase();
  return SECTIONS.includes(segment as AppSection) ? (segment as AppSection) : "dashboard";
}

export function App() {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const section = sectionFromPath(location.pathname);

  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [counts, setCounts] = useState<{ tasks: number | null; agents: number | null; runs: number | null; projects: number | null; stories: number | null }>({
    tasks: null,
    agents: null,
    runs: null,
    projects: null,
    stories: null,
  });

  useEffect(() => {
    fetchCounts()
      .then(setCounts)
      .catch(() => {});
  }, []);

  const navigate = (nextSection: AppSection) => {
    routerNavigate(`/${nextSection}`);
    setIsMobileSidebarOpen(false);
  };

  return (
    <main className="dashboard-bg">
      <button
        type="button"
        className="mobile-hamburger"
        onClick={() => setIsMobileSidebarOpen(true)}
        aria-label="Open navigation"
      >
        ☰
      </button>
      <div className={`dashboard-shell${isSidebarCollapsed ? " dashboard-shell--sidebar-collapsed" : ""}`}>
        <Sidebar
          activeSection={section}
          searchQuery={searchQuery}
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          counts={counts}
          onNavigate={navigate}
          onSearchChange={setSearchQuery}
          onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <Routes>
          <Route path="/dashboard" element={<DashboardPage onNavigate={navigate} searchQuery={searchQuery} />} />
          <Route path="/tasks" element={<TasksPage onNavigate={navigate} searchQuery={searchQuery} />} />
          <Route path="/stories" element={<StoriesPage onNavigate={navigate} />} />
          <Route path="/agents" element={<AgentsPage onNavigate={navigate} />} />
          <Route path="/runs" element={<RunsPage />} />
          <Route path="/projects" element={<ProjectsPage onNavigate={navigate} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </main>
  );
}
