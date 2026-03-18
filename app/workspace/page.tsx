import { activityFeed, workspaceCards } from "@/lib/mock-data";

export default function WorkspacePage() {
  return (
    <div className="page">
      <section className="section">
        <div className="container workspace-layout">
          <div className="workspace-main">
            <div className="section-heading">
              <span className="eyebrow">Workspace</span>
              <h1>링크와 인사이트를 엮는 운영 대시보드</h1>
              <p>
                이 화면은 로그인 이후 진입하는 기본 워크스페이스입니다. 실제 프로젝트 데이터,
                그래프 시각화, 검색, 태그, 협업 기능이 들어갈 자리를 이미 나눠두었습니다.
              </p>
            </div>

            <div className="workspace-hero-card">
              <div>
                <span>Weekly focus</span>
                <h2>University creator onboarding revamp</h2>
              </div>
              <p>
                3개의 실험 가설, 2개의 잠재 파트너십, 1개의 우선 해결 과제가 연결되어 있습니다.
              </p>
            </div>

            <div className="workspace-grid">
              {workspaceCards.map((card) => (
                <article key={card.title} className="workspace-card workspace-card--large">
                  <span>{card.eyebrow}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="workspace-sidebar">
            <div className="side-panel">
              <span className="eyebrow">Activity</span>
              <ul className="feed-list">
                {activityFeed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="side-panel side-panel--accent">
              <span className="eyebrow">Next integration</span>
              <p>
                Replace the demo cookie session with a real provider and connect this panel to live user,
                project, and graph data.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

