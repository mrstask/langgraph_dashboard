import type { ReactNode } from "react";

type InfoPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function InfoPanel({ title, description, children }: InfoPanelProps) {
  return (
    <article className="info-panel">
      <div className="info-panel-copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </article>
  );
}

