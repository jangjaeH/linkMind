import Link from "next/link";
import { notFound } from "next/navigation";

import { getGraphNodesByProjectFromDb, getProjectBySlugFromDb } from "@/lib/workspace-queries";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export default async function ProjectDetailPage({
  params
}: ProjectPageProps) {
  const project = await getProjectBySlugFromDb(params.slug);

  if (!project) {
    notFound();
  }

  const nodes = await getGraphNodesByProjectFromDb(project.slug);

  return (
    <div className="workspace-main">
      <div className="section-heading">
        <span className="eyebrow">{project.stage}</span>
        <h1>{project.name}</h1>
        <p>{project.summary}</p>
      </div>

      <div className="workspace-hero-card">
        <div>
          <span>Objective</span>
          <h2>{project.objective}</h2>
        </div>
        <p>{project.progressLabel}</p>
        <div className="tag-row">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="project-detail-grid">
        <section className="side-panel">
          <span className="eyebrow">Tasks</span>
          <ul className="task-list">
            {project.tasks.map((task) => (
              <li key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <small>
                    {task.owner} · {task.dueLabel}
                  </small>
                </div>
                <span className={`badge badge--${task.status}`}>{task.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="side-panel">
          <span className="eyebrow">Milestones</span>
          <ul className="milestone-list">
            {project.milestones.map((milestone) => (
              <li key={milestone.id}>
                <div className="milestone-list__row">
                  <strong>{milestone.title}</strong>
                  <span>{milestone.dateLabel}</span>
                </div>
                <div className="progress-bar">
                  <span style={{ width: `${milestone.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="section-heading section-heading--compact">
        <span className="eyebrow">Connected nodes</span>
        <h2>이 프로젝트에 연결된 지식 그래프</h2>
      </section>

      <div className="graph-board graph-board--compact">
        {nodes.map((node) => (
          <article key={node.id} className={`graph-card graph-card--${node.kind}`}>
            <div className="graph-card__top">
              <span className="badge">{node.kind}</span>
              <strong>{node.strength}</strong>
            </div>
            <h3>{node.label}</h3>
            <p>{node.summary}</p>
          </article>
        ))}
      </div>

      <Link className="ghost-button" href="/workspace">
        Back to dashboard
      </Link>
    </div>
  );
}
