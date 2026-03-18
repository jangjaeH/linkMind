import { getWorkspaceSnapshotFromDb } from "@/lib/workspace-queries";

export default async function InboxPage() {
  const workspace = await getWorkspaceSnapshotFromDb();

  return (
    <div className="workspace-main">
      <div className="section-heading">
        <span className="eyebrow">Inbox</span>
        <h1>새 링크와 메모를 프로젝트 흐름으로 분류하는 인박스</h1>
        <p>수집된 인사이트를 컬렉션과 프로젝트로 라우팅하기 전 단계의 큐입니다.</p>
      </div>

      <div className="inbox-list">
        {workspace.inbox.map((item) => (
          <article key={item.id} className="inbox-card">
            <div className="inbox-card__meta">
              <span className={`badge badge--${item.type}`}>{item.type}</span>
              <span>{item.source}</span>
              <span>{item.addedAt}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <div className="tag-row">
              <span className="tag">{item.tag}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
