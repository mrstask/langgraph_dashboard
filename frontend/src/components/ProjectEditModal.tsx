import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { ProjectRecord, ProjectUpdatePayload } from "../lib/api";

type ProjectEditModalProps = {
  isOpen: boolean;
  project: ProjectRecord | null;
  onClose: () => void;
  onSave: (projectId: number, payload: ProjectUpdatePayload) => Promise<void>;
};

export function ProjectEditModal({ isOpen, project, onClose, onSave }: ProjectEditModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !project) {
      return;
    }
    setName(project.name);
    setDescription(project.description ?? "");
    setRootPath(project.root_path ?? "");
    setIsSubmitting(false);
    setError(null);
  }, [isOpen, project]);

  if (!isOpen || !project) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-project-title">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Project Space</p>
            <h2 id="edit-project-title">Edit Project</h2>
          </div>
          <button type="button" className="icon-button icon-button--dark" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!name.trim()) {
              setError("Project name is required.");
              return;
            }
            setIsSubmitting(true);
            setError(null);
            try {
              await onSave(project.id, {
                name: name.trim(),
                description: description.trim(),
                root_path: rootPath.trim(),
              });
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Failed to update project");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="field-grid">
            <label className="field">
              <span>Key</span>
              <input value={project.key} disabled />
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
