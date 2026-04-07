import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ProjectCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: ProjectCreateFormValue) => Promise<void>;
};

export type ProjectCreateFormValue = {
  key: string;
  name: string;
  description: string;
  root_path: string;
};

export function ProjectCreateModal({ isOpen, onClose, onCreate }: ProjectCreateModalProps) {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setKey("");
    setName("");
    setDescription("");
    setRootPath("");
    setIsSubmitting(false);
    setError(null);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-project-title">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Project Space</p>
            <h2 id="create-project-title">Create Project</h2>
          </div>
          <button type="button" className="icon-button icon-button--dark" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!name.trim() || !key.trim()) {
              setError("Project key and name are required.");
              return;
            }
            setIsSubmitting(true);
            setError(null);
            try {
              await onCreate({
                key: key.trim().toUpperCase(),
                name: name.trim(),
                description: description.trim(),
                root_path: rootPath.trim(),
              });
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Failed to create project");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="field-grid">
            <label className="field">
              <span>Key</span>
              <input value={key} onChange={(event) => setKey(event.target.value.toUpperCase())} placeholder="OPS" />
            </label>

            <label className="field">
              <span>Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Operations Console"
              />
            </label>
          </div>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this project contains"
              rows={4}
            />
          </label>

          <label className="field">
            <span>Project Root</span>
            <input
              value={rootPath}
              onChange={(event) => setRootPath(event.target.value)}
              placeholder="/home/user/projects/my-project"
            />
          </label>

          {error ? <div className="status-banner status-banner--error">{error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
