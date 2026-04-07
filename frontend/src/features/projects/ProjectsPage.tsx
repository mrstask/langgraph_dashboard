import { useEffect, useState } from "react";

import type { AppSection } from "../../app/App";
import { InfoPanel } from "../../components/InfoPanel";
import { ProjectCreateModal, type ProjectCreateFormValue } from "../../components/ProjectCreateModal";
import { ProjectEditModal } from "../../components/ProjectEditModal";
import { TopBar } from "../../components/TopBar";
import {
  createProject,
  fetchProjects,
  updateProject,
  type ProjectRecord,
  type ProjectUpdatePayload,
} from "../../lib/api";

type ProjectsPageProps = {
  onNavigate: (section: AppSection) => void;
};

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const records = await fetchProjects();
        if (!cancelled) {
          setProjects(records);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load projects");
        }
      }
    }

    void loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateProject = async (payload: ProjectCreateFormValue) => {
    const createdProject = await createProject(payload);
    setProjects((currentProjects) => [createdProject, ...currentProjects]);
    setIsCreateOpen(false);
    setError(null);
  };

  const handleUpdateProject = async (projectId: number, payload: ProjectUpdatePayload) => {
    const updatedProject = await updateProject(projectId, payload);
    setProjects((currentProjects) =>
      currentProjects.map((p) => (p.id === projectId ? updatedProject : p)),
    );
    setEditingProject(null);
    setError(null);
  };

  return (
    <section className="dashboard-content">
      <TopBar
        eyebrow="Project Space"
        title="Projects"
        subtitle="The top-level containers for task boards and agent programs."
        primaryActionLabel="Create Project"
        secondaryActionLabel="Open Dashboard"
        onPrimaryAction={() => setIsCreateOpen(true)}
        onSecondaryAction={() => onNavigate("dashboard")}
      />

      {error ? <div className="status-banner status-banner--error">{error}</div> : null}

      <div className="panel-grid">
        {projects.map((project) => (
          <InfoPanel
            key={project.id}
            title={project.name}
            description={project.description ?? "No project description provided yet."}
          >
            <div className="detail-list">
              <div>
                <span>Key</span>
                <strong>{project.key}</strong>
              </div>
              {project.root_path ? (
                <div>
                  <span>Root</span>
                  <strong className="detail-mono">{project.root_path}</strong>
                </div>
              ) : null}
              <div>
                <span>Updated</span>
                <strong>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "Unknown"}</strong>
              </div>
            </div>
            <div className="info-panel-actions">
              <button
                type="button"
                className="secondary-button secondary-button--small"
                onClick={() => setEditingProject(project)}
              >
                Edit
              </button>
            </div>
          </InfoPanel>
        ))}
      </div>

      <ProjectCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProject}
      />

      <ProjectEditModal
        isOpen={editingProject !== null}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleUpdateProject}
      />
    </section>
  );
}
