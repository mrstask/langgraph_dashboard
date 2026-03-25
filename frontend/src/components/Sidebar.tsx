import type { AppSection } from "../app/App";

const navItems: Array<{ label: string; value: AppSection; count?: number }> = [
  { label: "Dashboard", value: "dashboard", count: 12 },
  { label: "Tasks", value: "tasks", count: 34 },
  { label: "Agents", value: "agents", count: 5 },
  { label: "Runs", value: "runs", count: 9 },
  { label: "Projects", value: "projects", count: 2 },
  { label: "Settings", value: "settings" },
];

type SidebarProps = {
  activeSection: AppSection;
  searchQuery: string;
  isCollapsed: boolean;
  onNavigate: (section: AppSection) => void;
  onSearchChange: (value: string) => void;
  onToggleCollapse: () => void;
};

export function Sidebar({
  activeSection,
  searchQuery,
  isCollapsed,
  onNavigate,
  onSearchChange,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside className={`sidebar${isCollapsed ? " sidebar--collapsed" : ""}`}>
      <button
        type="button"
        className="sidebar-toggle sidebar-toggle--edge"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? "›" : "‹"}
      </button>

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
              {!isCollapsed && item.count ? <span className="nav-count">{item.count}</span> : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
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
