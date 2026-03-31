import { useEffect, useRef, useState } from "react";

type Project = {
  id: number;
  key: string;
  name: string;
};

type ProjectDropdownProps = {
  projects: Project[];
  selectedId: number | null;
  onChange: (id: number | null) => void;
};

export function ProjectDropdown({ projects, selectedId, onChange }: ProjectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = projects.find((p) => p.id === selectedId);
  const label = selected ? selected.name : "All projects";

  function select(id: number | null) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div className="proj-dropdown" ref={ref}>
      <button
        type="button"
        className={`proj-dropdown__trigger${open ? " proj-dropdown__trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{label}</span>
        <svg
          className="proj-dropdown__chevron"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="proj-dropdown__menu" role="listbox">
          <button
            type="button"
            role="option"
            aria-selected={selectedId === null}
            className={`proj-dropdown__option${selectedId === null ? " proj-dropdown__option--active" : ""}`}
            onClick={() => select(null)}
          >
            <span>All projects</span>
            {selectedId === null && <CheckIcon />}
          </button>

          {projects.length > 0 && <div className="proj-dropdown__divider" />}

          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={selectedId === p.id}
              className={`proj-dropdown__option${selectedId === p.id ? " proj-dropdown__option--active" : ""}`}
              onClick={() => select(p.id)}
            >
              <span className="proj-dropdown__option-inner">
                <span className="proj-dropdown__key">{p.key}</span>
                <span>{p.name}</span>
              </span>
              {selectedId === p.id && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
