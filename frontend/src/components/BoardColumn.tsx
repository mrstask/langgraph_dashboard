import { useState, type ReactNode, Children } from "react";
import type { BoardColumnData } from "../lib/mockData";

const DEFAULT_VISIBLE = 8;

type BoardColumnProps = {
  id: BoardColumnData["id"];
  title: string;
  count: number;
  tone: "slate" | "blue" | "violet" | "amber" | "green" | "red";
  onCreateTask?: (columnId: BoardColumnData["id"]) => void;
  isActiveDropTarget?: boolean;
  onDragOver?: (columnId: BoardColumnData["id"]) => void;
  onDropTask?: (columnId: BoardColumnData["id"]) => void;
  children: ReactNode;
};

export function BoardColumn({
  id,
  title,
  count,
  tone,
  onCreateTask,
  isActiveDropTarget = false,
  onDragOver,
  onDropTask,
  children,
}: BoardColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(count === 0);
  const [isExpanded, setIsExpanded] = useState(false);

  const childArray = Children.toArray(children);
  const hasOverflow = childArray.length > DEFAULT_VISIBLE;
  const visibleChildren = isExpanded ? childArray : childArray.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = childArray.length - DEFAULT_VISIBLE;

  return (
    <section className="board-column">
      <header className={`column-header column-header--${tone}`}>
        <div className="column-title-group">
          <span className="column-count">{count}</span>
          <h2>{title}</h2>
        </div>
        <div className="column-header__actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            aria-label={isCollapsed ? `Expand ${title} column` : `Collapse ${title} column`}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "+" : "\u2013"}
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => onCreateTask?.(id)}
            aria-label={`Add task to ${title}`}
          >
            +
          </button>
        </div>
      </header>
      {!isCollapsed ? (
        <div
          className={`column-body ${isActiveDropTarget ? "column-body--active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            onDragOver?.(id);
          }}
          onDrop={(event) => {
            event.preventDefault();
            onDropTask?.(id);
          }}
        >
          {visibleChildren}
          {hasOverflow && !isExpanded ? (
            <button
              type="button"
              className="column-show-more"
              onClick={() => setIsExpanded(true)}
            >
              Show {hiddenCount} more
            </button>
          ) : null}
          {hasOverflow && isExpanded ? (
            <button
              type="button"
              className="column-show-more"
              onClick={() => setIsExpanded(false)}
            >
              Show less
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
