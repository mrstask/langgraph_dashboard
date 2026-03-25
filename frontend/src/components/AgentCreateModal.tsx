import { useEffect, useState } from "react";

type AgentCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: AgentCreateFormValue) => Promise<void>;
};

export type AgentCreateFormValue = {
  name: string;
  slug?: string | null;
  description: string;
  status: string;
  agent_type: string;
  capabilities: string[];
};

export function AgentCreateModal({ isOpen, onClose, onCreate }: AgentCreateModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("online");
  const [agentType, setAgentType] = useState("mock");
  const [capabilities, setCapabilities] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setName("");
    setSlug("");
    setDescription("");
    setStatus("online");
    setAgentType("mock");
    setCapabilities("");
    setIsSubmitting(false);
    setError(null);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-agent-title">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Agent Registry</p>
            <h2 id="create-agent-title">Create Agent</h2>
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
              setError("Agent name is required.");
              return;
            }
            setIsSubmitting(true);
            setError(null);
            try {
              await onCreate({
                name: name.trim(),
                slug: slug.trim() || null,
                description: description.trim(),
                status: status.trim(),
                agent_type: agentType.trim(),
                capabilities: capabilities
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              });
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Failed to create agent");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Reviewer" />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Slug</span>
              <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="optional" />
            </label>

            <label className="field">
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {["online", "busy", "offline"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Agent Type</span>
              <select value={agentType} onChange={(event) => setAgentType(event.target.value)}>
                {["mock", "langchain", "langgraph"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Capabilities</span>
              <input
                value={capabilities}
                onChange={(event) => setCapabilities(event.target.value)}
                placeholder="research, review, implementation"
              />
            </label>
          </div>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this agent is for"
              rows={4}
            />
          </label>

          {error ? <div className="status-banner status-banner--error">{error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
