import type { ReactNode } from "react";
import type { BoardColumnData } from "../lib/mockData";

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
  return (
    <section className="board-column">
      <header className={`column-header column-header--${tone}`}>
        <div className="column-title-group">
          <span className="column-count">{count}</span>
          <h2>{title}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={() => onCreateTask?.(id)}
          aria-label={`Add task to ${title}`}
        >
          +
        </button>
      </header>
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
        {children}
      </div>
    </section>
  );
}
