import Link from "next/link";

import {
  activityFeed,
  heroStats,
  pillars,
  workflowSteps,
  workspaceCards
} from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <span className="eyebrow">Linked product intelligence</span>
            <h1>아이디어, 링크, 사람, 의사결정을 하나의 흐름으로 묶는 LinkMind</h1>
            <p className="hero__copy">
              LinkMind는 흩어진 인사이트를 연결해서 제품팀과 창업팀이 더 빠르게 판단하도록 돕는
              워크스페이스입니다. 로그인 이후에는 개인화된 대시보드와 프로젝트 룸으로 자연스럽게
              이어질 수 있도록 구조를 잡아두었습니다.
            </p>
            <div className="hero__actions">
              <Link className="primary-button" href="/workspace">
                View workspace
              </Link>
              <Link className="ghost-button" href="/login">
                Sign in flow
              </Link>
            </div>

            <div className="hero__stats">
              {heroStats.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
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
              <span className="node node--core">Brand</span>
              <span className="node node--left">Research</span>
              <span className="node node--right">Growth</span>
              <span className="node node--bottom">Product</span>
            </div>
            <div className="hero-panel__list">
              {activityFeed.slice(0, 3).map((item) => (
                <div key={item} className="mini-card">
                  {item}
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
            {pillars.map((pillar) => (
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
              {workflowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="workspace-preview">
            {workspaceCards.map((card) => (
              <article key={card.title} className="workspace-card">
                <span>{card.eyebrow}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

