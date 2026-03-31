import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { StoryRecord } from "../lib/api";

type StoryEditModalProps = {
  story: StoryRecord | null;
  onClose: () => void;
  onUpdate: (storyId: number, title: string, description: string) => Promise<void>;
};

export function StoryEditModal({ story, onClose, onUpdate }: StoryEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!story) return;
    setTitle(story.title);
    setDescription(story.description ?? "");
    setError(null);
    setIsSubmitting(false);
  }, [story]);

  if (!story) return null;

  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-story-title">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Story</p>
            <h2 id="edit-story-title">Edit Story</h2>
          </div>
          <button type="button" className="icon-button icon-button--dark" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim()) {
              setError("Title is required.");
              return;
            }
            setIsSubmitting(true);
            setError(null);
            try {
              await onUpdate(story.id, title.trim(), description.trim());
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to update story");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Story title" />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What capability does this story cover? What integration or e2e test would validate it?"
              rows={5}
            />
          </label>

          <div className="story-edit-meta">
            <span>ID: {story.id}</span>
            <span>Created: {new Date(story.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(story.updated_at).toLocaleDateString()}</span>
          </div>

          {error ? <div className="status-banner status-banner--error">{error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
