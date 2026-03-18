import Link from "next/link";

import { getWorkspaceSnapshotFromDb } from "@/lib/workspace-queries";

export default async function HomePage() {
  const workspace = await getWorkspaceSnapshotFromDb();

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <span className="eyebrow">Linked product intelligence</span>
            <h1>{workspace.headline}</h1>
            <p className="hero__copy">{workspace.focusSummary}</p>
            <div className="hero__actions">
              <Link className="primary-button" href="/workspace">
                View workspace
              </Link>
              <Link className="ghost-button" href="/login">
                Sign in flow
              </Link>
            </div>

            <div className="hero__stats">
              {workspace.heroStats.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                  <small>{stat.detail}</small>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel__header">
              <span>Intelligence Board</span>
              <span>Live Overview</span>
            </div>
            <div className="hero-panel__graph">
              <span className="node node--core">{workspace.graphNodes[0]?.label}</span>
              <span className="node node--left">{workspace.graphNodes[2]?.label}</span>
              <span className="node node--right">{workspace.graphNodes[4]?.label}</span>
              <span className="node node--bottom">{workspace.graphNodes[1]?.label}</span>
            </div>
            <div className="hero-panel__list">
              {workspace.activity.slice(0, 3).map((item) => (
                <div key={item.id} className="mini-card">
                  {item.actor} {item.action} {item.target}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Core experience</span>
            <h2>정보를 저장하는 수준을 넘어서 연결하고 행동으로 바꾸는 구조</h2>
          </div>
          <div className="pillars-grid">
            {workspace.pillars.map((pillar) => (
              <article key={pillar.title} className="feature-card">
                <span className="feature-card__index">{pillar.title}</span>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container split-layout">
          <div>
            <span className="eyebrow">Suggested IA</span>
            <h2>로그인 전후 흐름을 자연스럽게 연결하는 정보 구조</h2>
            <ul className="check-list">
              {workspace.workflowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="workspace-preview">
            {workspace.projects.map((project) => (
              <article key={project.id} className="workspace-card">
                <span>{project.stage}</span>
                <h3>{project.name}</h3>
                <p>{project.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
