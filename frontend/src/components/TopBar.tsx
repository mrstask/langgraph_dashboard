import { ProjectDropdown } from "./ProjectDropdown";

type Project = {
  id: number;
  key: string;
  name: string;
};

export type SortValue = "newest" | "priority" | "agent";

type TopBarProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  projects?: Project[];
  selectedProjectId?: number | null;
  sortValue?: SortValue;
  onProjectChange?: (id: number | null) => void;
  onSortChange?: (value: SortValue) => void;
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
  sortValue,
  onProjectChange,
  onSortChange,
  onPrimaryAction,
  onSecondaryAction,
}: TopBarProps) {
  const hasActions = onProjectChange || onSortChange || onSecondaryAction || onPrimaryAction;

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle ? <p className="topbar-subtitle">{subtitle}</p> : null}
      </div>

      {hasActions ? (
        <div className="topbar-actions">
          {onProjectChange ? (
            <ProjectDropdown
              projects={projects}
              selectedId={selectedProjectId}
              onChange={onProjectChange}
            />
          ) : null}
          {onSortChange ? (
            <select
              className="topbar-sort"
              value={sortValue ?? "newest"}
              onChange={(e) => onSortChange(e.target.value as SortValue)}
            >
              <option value="newest">Newest</option>
              <option value="priority">Priority</option>
              <option value="agent">Agent</option>
            </select>
          ) : null}
          {onSecondaryAction ? (
            <button className="topbar-secondary-btn" type="button" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </button>
          ) : null}
          {onPrimaryAction ? (
            <button className="topbar-primary-btn" type="button" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
