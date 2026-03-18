import { InterestManager } from "@/components/interest-manager";
import { getInterests, getScrapedItems } from "@/lib/interest-scraper";

export default async function InterestsPage() {
  const [interests, items] = await Promise.all([getInterests(), getScrapedItems()]);
  const latestItems = items.slice(0, 12);
  const newestItem = latestItems[0];

  return (
    <div className="workspace-main">
      <div className="section-heading">
        <span className="eyebrow">Interests</span>
        <h1>관심사 기반 AI 스크랩 보드</h1>
        <p>원하는 키워드를 등록하고 스크랩을 실행하면 관련 자료를 요약해서 이 보드에 쌓습니다.</p>
      </div>

      <div className="workspace-metrics">
        <article className="metric-card">
          <span>Tracked interests</span>
          <strong>{interests.length}</strong>
          <p>지금 워크스페이스에서 계속 추적 중인 관심사 키워드 수입니다.</p>
        </article>
        <article className="metric-card">
          <span>Scraped items</span>
          <strong>{items.length}</strong>
          <p>현재 보드에서 바로 검토할 수 있는 최신 스크랩 결과입니다.</p>
        </article>
        <article className="metric-card">
          <span>Latest update</span>
          <strong>{newestItem?.published_label ?? "방금"}</strong>
          <p>{newestItem ? `${newestItem.keyword} 관련 최신 결과가 반영되어 있습니다.` : "아직 수집된 결과가 없습니다."}</p>
        </article>
      </div>

      <div className="side-panel">
        <span className="eyebrow">Manage interests</span>
        <InterestManager initialInterests={interests} />
      </div>

      <div className="inbox-list">
        {latestItems.map((item) => (
          <article key={item.id} className="inbox-card">
            <div className="inbox-card__meta">
              <span className="badge">{item.keyword}</span>
              <span>{item.source}</span>
              <span>{item.published_label ?? "방금 수집"}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <p>{item.relevance_reason}</p>
            {item.source_url ? (
              <a className="ghost-button" href={item.source_url} target="_blank" rel="noreferrer">
                Open source
              </a>
            ) : null}
          </article>
        ))}
      </div>

      {latestItems.length === 0 ? (
        <div className="side-panel">
          <span className="eyebrow">Empty state</span>
          <p>관심사를 추가한 뒤 스크랩을 실행하면 여기에 관련 기사와 요약이 쌓입니다.</p>
        </div>
      ) : null}
    </div>
  );
}
