type TopBarProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

export function TopBar({
  eyebrow = "Agent Operations",
  title,
  subtitle,
  primaryActionLabel = "Create Task",
  secondaryActionLabel = "Create Agent",
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
        <select defaultValue="all">
          <option value="all">All projects</option>
          <option value="ops">Operations Console</option>
          <option value="rnd">Research Pipelines</option>
        </select>
        <select defaultValue="newest">
          <option value="newest">Newest</option>
          <option value="priority">Priority</option>
          <option value="agent">Agent</option>
        </select>
        <button className="secondary-button" type="button" onClick={onSecondaryAction}>
          {secondaryActionLabel}
        </button>
        <button className="primary-button" type="button" onClick={onPrimaryAction}>
          {primaryActionLabel}
        </button>
      </div>
    </header>
  );
}
