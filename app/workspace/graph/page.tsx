import { getWorkspaceSnapshotFromDb } from "@/lib/workspace-queries";

export default async function GraphPage() {
  const workspace = await getWorkspaceSnapshotFromDb();

  return (
    <div className="workspace-main">
      <div className="section-heading">
        <span className="eyebrow">Graph</span>
        <h1>아이디어와 프로젝트를 관계 중심으로 보는 인텔리전스 그래프</h1>
        <p>연구, 프로젝트, 파트너 노드를 한 화면에 배치해 연결 구조를 보여줍니다.</p>
      </div>

      <div className="graph-board">
        {workspace.graphNodes.map((node) => (
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
    </div>
  );
}
