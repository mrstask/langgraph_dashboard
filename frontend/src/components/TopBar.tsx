import { ProjectDropdown } from "./ProjectDropdown";

type Project = {
  id: number;
  key: string;
  name: string;
};

type TopBarProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  projects?: Project[];
  selectedProjectId?: number | null;
  onProjectChange?: (id: number | null) => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

export function TopBar({
  eyebrow = "Agent Operations",
  title,
  subtitle,
  primaryActionLabel = "Create Task",
  secondaryActionLabel = "Create Agent",
  projects = [],
  selectedProjectId = null,
  onProjectChange,
  onPrimaryAction,
  onSecondaryAction,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle ? <p className="topbar-subtitle">{subtitle}</p> : null}
      </div>

      <div className="topbar-actions">
        <ProjectDropdown
          projects={projects}
          selectedId={selectedProjectId}
          onChange={onProjectChange ?? (() => {})}
        />
        <select className="topbar-sort" defaultValue="newest">
          <option value="newest">Newest</option>
          <option value="priority">Priority</option>
          <option value="agent">Agent</option>
        </select>
        <button className="topbar-secondary-btn" type="button" onClick={onSecondaryAction}>
          {secondaryActionLabel}
        </button>
        <button className="topbar-primary-btn" type="button" onClick={onPrimaryAction}>
          {primaryActionLabel}
        </button>
      </div>
    </header>
  );
}
