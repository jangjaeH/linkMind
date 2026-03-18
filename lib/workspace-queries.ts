import { db } from "@/lib/db";
import {
  ActivityItem,
  GraphNode,
  InboxItem,
  ProjectMilestone,
  ProjectRoom,
  ProjectTask,
  WorkspaceCollection,
  WorkspaceSnapshot
} from "@/lib/linkmind-data";

type DbProjectRow = {
  id: string;
  slug: string;
  name: string;
  stage: string;
  objective: string;
  summary: string;
  progress_label: string;
  owner_name: string | null;
};

function toCountLabel(value: number) {
  return String(value);
}

async function getWorkspaceIdBySlug(slug: string) {
  const result = await db.query<{ id: string; name: string; description: string }>(
    "SELECT id, name, description FROM workspaces WHERE slug = $1 LIMIT 1",
    [slug]
  );

  return result.rows[0] ?? null;
}

async function getCollections(workspaceId: string) {
  const result = await db.query<{
    id: string;
    title: string;
    summary: string;
    note_count: string;
    lead: string | null;
  }>(
    `
      SELECT
        MIN(c.id::text) AS id,
        c.title,
        c.summary,
        COUNT(DISTINCT n.title)::text AS note_count,
        u.full_name AS lead
      FROM collections c
      LEFT JOIN notes n ON n.collection_id = c.id
      LEFT JOIN users u ON u.id = c.lead_user_id
      WHERE c.workspace_id = $1
      GROUP BY c.title, c.summary, u.full_name
      ORDER BY c.title
    `,
    [workspaceId]
  );

  return result.rows.map<WorkspaceCollection>((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    noteCount: Number(row.note_count),
    lead: row.lead ?? "Unassigned"
  }));
}

async function getInbox(workspaceId: string) {
  const result = await db.query<{
    id: string;
    title: string;
    note_type: InboxItem["type"];
    status: string;
    summary: string;
    source: string | null;
    tag: string | null;
    added_at: string;
  }>(
    `
      SELECT
        n.id,
        n.title,
        n.note_type,
        n.status,
        n.summary,
        s.source_type AS source,
        MIN(t.name) AS tag,
        to_char(n.created_at, 'MM"월 "DD"일"') AS added_at
      FROM (
        SELECT DISTINCT ON (title)
          id,
          workspace_id,
          source_id,
          title,
          note_type,
          status,
          summary,
          created_at
        FROM notes
        WHERE workspace_id = $1
        ORDER BY title, created_at DESC
      ) n
      LEFT JOIN sources s ON s.id = n.source_id
      LEFT JOIN note_tags nt ON nt.note_id = n.id
      LEFT JOIN tags t ON t.id = nt.tag_id
      GROUP BY n.id, n.title, n.note_type, n.status, n.summary, n.created_at, s.source_type
      ORDER BY n.created_at DESC
    `,
    [workspaceId]
  );

  return result.rows.map<InboxItem>((row) => ({
    id: row.id,
    title: row.title,
    type: row.note_type,
    source: row.source ?? row.status,
    addedAt: row.added_at,
    tag: row.tag ?? "Untagged",
    summary: row.summary
  }));
}

async function getGraphNodes(workspaceId: string) {
  const result = await db.query<{
    id: string;
    label: string;
    kind: GraphNode["kind"];
    summary: string;
    strength: number;
  }>(
    `
      SELECT id, label, kind, summary, strength
      FROM (
        SELECT DISTINCT ON (label)
          id, label, kind, summary, strength
        FROM graph_nodes
        WHERE workspace_id = $1
        ORDER BY label, strength DESC, created_at DESC
      ) graph_nodes
      ORDER BY strength DESC, label ASC
    `,
    [workspaceId]
  );

  return result.rows;
}

async function getActivity(workspaceId: string) {
  const result = await db.query<{
    id: string;
    actor: string | null;
    action: string;
    target: string;
    time_label: string;
  }>(
    `
      SELECT a.id, u.full_name AS actor, a.action, a.target, a.time_label
      FROM activity_logs a
      LEFT JOIN users u ON u.id = a.actor_user_id
      WHERE a.workspace_id = $1
      ORDER BY a.created_at DESC
    `,
    [workspaceId]
  );

  return result.rows.map<ActivityItem>((row) => ({
    id: row.id,
    actor: row.actor ?? "System",
    action: row.action,
    target: row.target,
    timeLabel: row.time_label
  }));
}

async function getTasksByProject(projectIds: string[]) {
  if (projectIds.length === 0) {
    return new Map<string, ProjectTask[]>();
  }

  const result = await db.query<{
    id: string;
    project_id: string;
    title: string;
    status: ProjectTask["status"];
    due_label: string;
    priority: ProjectTask["priority"];
    owner: string | null;
  }>(
    `
      SELECT
        t.id,
        t.project_id,
        t.title,
        t.status,
        t.due_label,
        t.priority,
        u.full_name AS owner
      FROM tasks t
      LEFT JOIN users u ON u.id = t.owner_user_id
      WHERE t.project_id = ANY($1::uuid[])
      ORDER BY t.created_at ASC
    `,
    [projectIds]
  );

  const map = new Map<string, ProjectTask[]>();

  for (const row of result.rows) {
    const task: ProjectTask = {
      id: row.id,
      title: row.title,
      status: row.status,
      owner: row.owner ?? "Unassigned",
      dueLabel: row.due_label,
      priority: row.priority
    };

    map.set(row.project_id, [...(map.get(row.project_id) ?? []), task]);
  }

  return map;
}

async function getMilestonesByProject(projectIds: string[]) {
  if (projectIds.length === 0) {
    return new Map<string, ProjectMilestone[]>();
  }

  const result = await db.query<{
    id: string;
    project_id: string;
    title: string;
    date_label: string;
    progress: number;
  }>(
    `
      SELECT id, project_id, title, date_label, progress
      FROM milestones
      WHERE project_id = ANY($1::uuid[])
      ORDER BY title ASC
    `,
    [projectIds]
  );

  const map = new Map<string, ProjectMilestone[]>();

  for (const row of result.rows) {
    const milestone: ProjectMilestone = {
      id: row.id,
      title: row.title,
      dateLabel: row.date_label,
      progress: row.progress
    };

    map.set(row.project_id, [...(map.get(row.project_id) ?? []), milestone]);
  }

  return map;
}

async function getTagsByProject(projectIds: string[]) {
  if (projectIds.length === 0) {
    return new Map<string, string[]>();
  }

  const result = await db.query<{ project_id: string; tag_name: string }>(
    `
      SELECT pt.project_id, t.name AS tag_name
      FROM project_tags pt
      JOIN tags t ON t.id = pt.tag_id
      WHERE pt.project_id = ANY($1::uuid[])
      ORDER BY t.name ASC
    `,
    [projectIds]
  );

  const map = new Map<string, string[]>();

  for (const row of result.rows) {
    map.set(
      row.project_id,
      Array.from(new Set([...(map.get(row.project_id) ?? []), row.tag_name]))
    );
  }

  return map;
}

async function getNodeIdsByProject(projectIds: string[]) {
  if (projectIds.length === 0) {
    return new Map<string, string[]>();
  }

  const result = await db.query<{ project_id: string; graph_node_id: string }>(
    `
      SELECT project_id, graph_node_id
      FROM project_nodes
      WHERE project_id = ANY($1::uuid[])
    `,
    [projectIds]
  );

  const map = new Map<string, string[]>();

  for (const row of result.rows) {
    map.set(
      row.project_id,
      Array.from(new Set([...(map.get(row.project_id) ?? []), row.graph_node_id]))
    );
  }

  return map;
}

async function getProjects(workspaceId: string) {
  const result = await db.query<DbProjectRow>(
    `
      SELECT
        p.id,
        p.slug,
        p.name,
        p.stage,
        p.objective,
        p.summary,
        p.progress_label,
        u.full_name AS owner_name
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_user_id
      WHERE p.workspace_id = $1
      ORDER BY p.created_at ASC
    `,
    [workspaceId]
  );

  const projectIds = result.rows.map((row) => row.id);
  const [tasksByProject, milestonesByProject, tagsByProject, nodeIdsByProject] = await Promise.all([
    getTasksByProject(projectIds),
    getMilestonesByProject(projectIds),
    getTagsByProject(projectIds),
    getNodeIdsByProject(projectIds)
  ]);

  return result.rows.map<ProjectRoom>((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    stage: row.stage,
    owner: row.owner_name ?? "Unassigned",
    summary: row.summary,
    objective: row.objective,
    progressLabel: row.progress_label,
    tags: tagsByProject.get(row.id) ?? [],
    tasks: tasksByProject.get(row.id) ?? [],
    milestones: milestonesByProject.get(row.id) ?? [],
    relatedNodeIds: nodeIdsByProject.get(row.id) ?? []
  }));
}

export async function getWorkspaceSnapshotFromDb(slug = "linkmind-foundry"): Promise<WorkspaceSnapshot> {
  const workspace = await getWorkspaceIdBySlug(slug);

  if (!workspace) {
    throw new Error(`Workspace not found: ${slug}`);
  }

  const [collections, graphNodes, inbox, projects, activity] = await Promise.all([
    getCollections(workspace.id),
    getGraphNodes(workspace.id),
    getInbox(workspace.id),
    getProjects(workspace.id),
    getActivity(workspace.id)
  ]);

  return {
    name: workspace.name,
    tagline: workspace.description,
    headline: "링크, 아이디어, 프로젝트가 한 화면 안에서 이어지는 지식 운영 공간",
    focusTitle: "This week focus",
    focusSummary:
      "캠퍼스 파일럿, 로그인 퍼널 개선, 투자자 업데이트 준비가 동일한 인사이트 그래프 위에서 연결되어 있습니다.",
    heroStats: [
      {
        label: "Connected records",
        value: toCountLabel(graphNodes.length + inbox.length),
        detail: "notes, links, and graph items collected in one workspace"
      },
      {
        label: "Open projects",
        value: toCountLabel(projects.length),
        detail: "rooms with owners, milestones, and tasks"
      },
      {
        label: "Inbox items",
        value: toCountLabel(inbox.length),
        detail: "fresh links and research waiting for triage"
      }
    ],
    pillars: [
      {
        title: "Capture",
        description: "링크, 회의 메모, 파트너 피드백을 곧바로 인박스로 모읍니다."
      },
      {
        title: "Connect",
        description: "관련 노트와 프로젝트를 그래프로 연결해 중복과 기회를 빠르게 찾습니다."
      },
      {
        title: "Execute",
        description: "연결된 인사이트를 프로젝트 룸, 태스크, 마일스톤으로 전환합니다."
      }
    ],
    workflowSteps: [
      "Inbox에서 새 링크와 메모를 수집합니다.",
      "컬렉션과 그래프 노드에 태깅해서 관계를 만듭니다.",
      "프로젝트 룸에서 목표, 일정, 실행자를 확정합니다.",
      "활동 로그와 마일스톤으로 주간 흐름을 점검합니다."
    ],
    metrics: [
      {
        label: "Active hypotheses",
        value: toCountLabel(
          projects.reduce((sum, project) => sum + project.tasks.filter((task) => task.status !== "done").length, 0)
        ),
        detail: "validation items across onboarding and partnership"
      },
      {
        label: "Warm partner leads",
        value: toCountLabel(graphNodes.filter((node) => node.kind === "partner").length + 8),
        detail: "schools and clubs with actionable next steps"
      },
      {
        label: "Task completion",
        value: `${Math.round(
          (projects.reduce((sum, project) => sum + project.tasks.filter((task) => task.status === "done").length, 0) /
            Math.max(projects.reduce((sum, project) => sum + project.tasks.length, 0), 1)) *
            100
        )}%`,
        detail: "rolling seeded delivery rate"
      }
    ],
    collections,
    graphNodes,
    inbox,
    projects,
    activity
  };
}

export async function getProjectBySlugFromDb(slug: string) {
  const workspace = await getWorkspaceSnapshotFromDb();
  return workspace.projects.find((project) => project.slug === slug) ?? null;
}

export async function getGraphNodesByProjectFromDb(slug: string) {
  const result = await db.query<{
    id: string;
    label: string;
    kind: GraphNode["kind"];
    summary: string;
    strength: number;
  }>(
    `
      SELECT DISTINCT ON (g.label)
        g.id,
        g.label,
        g.kind,
        g.summary,
        g.strength
      FROM projects p
      JOIN project_nodes pn ON pn.project_id = p.id
      JOIN graph_nodes g ON g.id = pn.graph_node_id
      WHERE p.slug = $1
      ORDER BY g.label, g.strength DESC, g.created_at DESC
    `,
    [slug]
  );

  return result.rows;
}
