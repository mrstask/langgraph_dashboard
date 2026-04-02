import type { AppSection } from "../app/App";

type SidebarCounts = {
  tasks: number | null;
  agents: number | null;
  runs: number | null;
  projects: number | null;
  stories: number | null;
};

type SidebarProps = {
  activeSection: AppSection;
  searchQuery: string;
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  counts?: SidebarCounts;
  onNavigate: (section: AppSection) => void;
  onSearchChange: (value: string) => void;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
};

const emptyCounts = { tasks: null, agents: null, runs: null, projects: null, stories: null };

export function Sidebar({
  activeSection,
  searchQuery,
  isCollapsed,
  isMobileOpen = false,
  counts = emptyCounts,
  onNavigate,
  onSearchChange,
  onToggleCollapse,
  onCloseMobile,
  theme = "light",
  onToggleTheme,
}: SidebarProps) {
  const navItems: Array<{ label: string; value: AppSection; count?: number | null }> = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Tasks", value: "tasks", count: counts.tasks },
    { label: "Stories", value: "stories", count: counts.stories },
    { label: "Agents", value: "agents", count: counts.agents },
    { label: "Runs", value: "runs", count: counts.runs },
    { label: "Projects", value: "projects", count: counts.projects },
    { label: "Queue", value: "queue" },
    { label: "Settings", value: "settings" },
  ];
  return (
    <aside className={`sidebar${isCollapsed ? " sidebar--collapsed" : ""}${isMobileOpen ? " sidebar--mobile-open" : ""}`}>
      {isMobileOpen ? (
        <button
          type="button"
          className="sidebar-toggle sidebar-toggle--edge"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        >
          ✕
        </button>
      ) : (
        <button
          type="button"
          className="sidebar-toggle sidebar-toggle--edge"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "›" : "‹"}
        </button>
      )}

      <div>
        <div className="sidebar-head">
          <div className="brand">
            <div className="brand-mark">A</div>
            {!isCollapsed ? (
              <div>
                <strong>agentboard</strong>
                <p>task operations</p>
              </div>
            ) : null}
          </div>
        </div>

        <label className="search-field">
          <div className="search-field__icon" aria-hidden="true">
            ⌕
          </div>
          <input
            type="search"
            placeholder={isCollapsed ? "Search" : "Search tasks, labels, agents"}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search tasks, labels, and agents"
          />
        </label>

        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={item.value === activeSection ? "active" : ""}
              onClick={() => onNavigate(item.value)}
              title={isCollapsed ? item.label : undefined}
            >
              {isCollapsed ? <span className="sidebar-nav__glyph">{item.label[0]}</span> : <span>{item.label}</span>}
              {!isCollapsed && item.count !== undefined ? (
                <span className="nav-count">{item.count ?? "—"}</span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        {onToggleTheme ? (
          <button
            type="button"
            className="sidebar-theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? "\u263E" : "\u2600"}{" "}
            {!isCollapsed ? (theme === "light" ? "Dark mode" : "Light mode") : null}
          </button>
        ) : null}
        <div className="pro-card">
          {isCollapsed ? (
            <strong>MR</strong>
          ) : (
            <>
              <span>Pipeline Mode</span>
              <strong>Mock Runtime</strong>
            </>
          )}
        </div>
        <div className="profile-card">
          <div className="avatar">SL</div>
          {!isCollapsed ? (
            <div>
              <strong>Stanislav</strong>
              <p>Workspace owner</p>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
