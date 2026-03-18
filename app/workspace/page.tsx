import Link from "next/link";

import { getInterests, getScrapedItems } from "@/lib/interest-scraper";
import { getWorkspaceSnapshotFromDb } from "@/lib/workspace-queries";

export default async function WorkspacePage() {
  const [workspace, interests, scrapedItems] = await Promise.all([
    getWorkspaceSnapshotFromDb(),
    getInterests(),
    getScrapedItems()
  ]);
  const interestHighlights = scrapedItems.slice(0, 3);

  return (
    <div className="workspace-layout">
      <div className="workspace-main">
        <div className="section-heading">
          <span className="eyebrow">Workspace</span>
          <h1>링크와 인사이트를 엮는 운영 대시보드</h1>
          <p>{workspace.focusSummary}</p>
        </div>

        <div className="workspace-metrics">
          {workspace.metrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>

        <div className="workspace-hero-card">
          <div>
            <span>{workspace.focusTitle}</span>
            <h2>{workspace.projects[0]?.name}</h2>
          </div>
          <p>{workspace.projects[0]?.objective}</p>
          <Link className="primary-button" href={`/workspace/projects/${workspace.projects[0]?.slug}`}>
            Open room
          </Link>
        </div>

        <div className="workspace-grid">
          {workspace.projects.map((project) => (
            <article key={project.id} className="workspace-card workspace-card--large">
              <span>{project.stage}</span>
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <Link className="ghost-button" href={`/workspace/projects/${project.slug}`}>
                View details
              </Link>
            </article>
          ))}
        </div>

        <div className="side-panel">
          <div className="inbox-card__meta">
            <span className="eyebrow">Interest feed</span>
            <span>{interests.length} active interests</span>
          </div>
          <h3>내 관심사 기반 최신 수집 결과</h3>
          <p>등록한 키워드로 모은 최신 기사와 인사이트를 바로 확인하고, 필요한 항목은 인박스나 프로젝트로 연결할 수 있습니다.</p>
          <div className="inbox-list">
            {interestHighlights.map((item) => (
              <article key={item.id} className="inbox-card">
                <div className="inbox-card__meta">
                  <span className="badge">{item.keyword}</span>
                  <span>{item.published_label ?? "방금 수집"}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
          <Link className="ghost-button" href="/workspace/interests">
            Open interest board
          </Link>
        </div>
      </div>

      <aside className="workspace-sidebar">
        <div className="side-panel">
          <span className="eyebrow">Activity</span>
          <ul className="feed-list">
            {workspace.activity.map((item) => (
              <li key={item.id}>
                {item.actor} {item.action} {item.target}
                <small>{item.timeLabel}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className="side-panel side-panel--accent">
          <span className="eyebrow">AI pipeline</span>
          <p>
            관심사 키워드, 스크랩 결과, 로그인 세션, 워크스페이스 데이터가 모두 연결되어 있어서 이제는
            요약 정교화와 액션 자동화 쪽으로 바로 확장할 수 있습니다.
          </p>
        </div>
      </aside>
    </div>
  );
}
