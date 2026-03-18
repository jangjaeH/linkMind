export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type GraphNode = {
  id: string;
  label: string;
  kind: "idea" | "research" | "project" | "partner";
  summary: string;
  strength: number;
};

export type InboxItem = {
  id: string;
  title: string;
  type: "link" | "research" | "task" | "meeting";
  source: string;
  addedAt: string;
  tag: string;
  summary: string;
};

export type ProjectTask = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  owner: string;
  dueLabel: string;
  priority: "high" | "medium" | "low";
};

export type ProjectMilestone = {
  id: string;
  title: string;
  dateLabel: string;
  progress: number;
};

export type ProjectRoom = {
  id: string;
  slug: string;
  name: string;
  stage: string;
  owner: string;
  summary: string;
  objective: string;
  progressLabel: string;
  tags: string[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  relatedNodeIds: string[];
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  timeLabel: string;
};

export type WorkspaceCollection = {
  id: string;
  title: string;
  summary: string;
  noteCount: number;
  lead: string;
};

export type WorkspaceSnapshot = {
  name: string;
  tagline: string;
  headline: string;
  focusTitle: string;
  focusSummary: string;
  heroStats: Metric[];
  pillars: { title: string; description: string }[];
  workflowSteps: string[];
  metrics: Metric[];
  collections: WorkspaceCollection[];
  graphNodes: GraphNode[];
  inbox: InboxItem[];
  projects: ProjectRoom[];
  activity: ActivityItem[];
};

const graphNodes: GraphNode[] = [
  {
    id: "brand-club",
    label: "Brand Club",
    kind: "idea",
    summary: "Student creator community concept that anchors the referral loop.",
    strength: 92
  },
  {
    id: "campus-pilot",
    label: "Campus Pilot",
    kind: "project",
    summary: "First structured onboarding experiment for university creator teams.",
    strength: 84
  },
  {
    id: "creator-research",
    label: "Creator Research",
    kind: "research",
    summary: "Interviews and drop-off analysis around onboarding motivation.",
    strength: 78
  },
  {
    id: "partner-map",
    label: "Partner Map",
    kind: "partner",
    summary: "University and club partnership shortlist with warm intros.",
    strength: 66
  },
  {
    id: "login-funnel",
    label: "Login Funnel",
    kind: "project",
    summary: "Authentication flow cleanup to reduce friction before activation.",
    strength: 88
  },
  {
    id: "growth-loop",
    label: "Growth Loop",
    kind: "idea",
    summary: "Invite, share, and collaboration mechanism tied to activation.",
    strength: 73
  }
];

const projects: ProjectRoom[] = [
  {
    id: "proj-campus-pilot",
    slug: "campus-pilot",
    name: "Campus Pilot",
    stage: "Execution",
    owner: "Jaehyeok",
    summary: "대학교 크리에이터 커뮤니티 대상 첫 파트너십 파일럿을 설계하고 실행합니다.",
    objective: "3개 대학 파트너와 온보딩 실험을 돌려 활성화율 35%를 검증한다.",
    progressLabel: "68% aligned",
    tags: ["Partnership", "Onboarding", "Pilot"],
    relatedNodeIds: ["campus-pilot", "creator-research", "partner-map"],
    tasks: [
      {
        id: "task-campus-1",
        title: "Warm intro 가능한 대학 동아리 10곳 정리",
        status: "doing",
        owner: "Jaehyeok",
        dueLabel: "오늘",
        priority: "high"
      },
      {
        id: "task-campus-2",
        title: "파일럿 참여 페이지 카피 초안 마무리",
        status: "todo",
        owner: "Min",
        dueLabel: "내일",
        priority: "high"
      },
      {
        id: "task-campus-3",
        title: "참여자 인센티브 구조 검토",
        status: "done",
        owner: "Ara",
        dueLabel: "완료",
        priority: "medium"
      }
    ],
    milestones: [
      {
        id: "ms-campus-1",
        title: "Pilot offer finalized",
        dateLabel: "3월 21일",
        progress: 90
      },
      {
        id: "ms-campus-2",
        title: "First partner kickoff",
        dateLabel: "3월 25일",
        progress: 62
      }
    ]
  },
  {
    id: "proj-login-funnel",
    slug: "login-funnel",
    name: "Login Funnel Refinement",
    stage: "Discovery",
    owner: "Jaehyeok",
    summary: "이메일 인증과 첫 워크스페이스 진입 사이의 이탈 구간을 줄이는 작업입니다.",
    objective: "가입 완료 후 첫 가치 인지까지의 시간을 3분 이하로 줄인다.",
    progressLabel: "41% aligned",
    tags: ["Authentication", "UX", "Activation"],
    relatedNodeIds: ["login-funnel", "growth-loop", "creator-research"],
    tasks: [
      {
        id: "task-login-1",
        title: "회원가입 후 빈 상태 onboarding 카드 추가",
        status: "todo",
        owner: "Jaehyeok",
        dueLabel: "이번 주",
        priority: "high"
      },
      {
        id: "task-login-2",
        title: "이메일 인증 대기 화면 메시지 개선",
        status: "doing",
        owner: "Min",
        dueLabel: "목요일",
        priority: "medium"
      }
    ],
    milestones: [
      {
        id: "ms-login-1",
        title: "Updated auth copy reviewed",
        dateLabel: "3월 20일",
        progress: 50
      }
    ]
  },
  {
    id: "proj-investor-update",
    slug: "investor-update",
    name: "Investor Update",
    stage: "Planning",
    owner: "Ara",
    summary: "트랙션, 인사이트, 다음 라운드 대비 핵심 내러티브를 정리합니다.",
    objective: "한 장 요약만 봐도 제품 방향성과 실행력이 이해되도록 만든다.",
    progressLabel: "24% aligned",
    tags: ["Narrative", "Metrics", "Fundraising"],
    relatedNodeIds: ["brand-club", "growth-loop", "partner-map"],
    tasks: [
      {
        id: "task-investor-1",
        title: "활성 사용자와 재방문 지표 정리",
        status: "todo",
        owner: "Ara",
        dueLabel: "금요일",
        priority: "medium"
      }
    ],
    milestones: [
      {
        id: "ms-investor-1",
        title: "Draft narrative complete",
        dateLabel: "3월 28일",
        progress: 20
      }
    ]
  }
];

const inbox: InboxItem[] = [
  {
    id: "inbox-1",
    title: "학생 창업 동아리 커뮤니티 운영 사례",
    type: "link",
    source: "Web archive",
    addedAt: "10분 전",
    tag: "Community",
    summary: "국내외 캠퍼스 커뮤니티의 성장 루프와 운영 인센티브 정리."
  },
  {
    id: "inbox-2",
    title: "가입 직후 이탈 사용자 인터뷰 요약",
    type: "research",
    source: "User interview",
    addedAt: "1시간 전",
    tag: "Auth",
    summary: "초기 가치 제안이 늦게 보이고 입력 피로가 높다는 피드백."
  },
  {
    id: "inbox-3",
    title: "대학 파트너십 제안서 업데이트 요청",
    type: "task",
    source: "Slack",
    addedAt: "오늘",
    tag: "Partner",
    summary: "브랜드 소개보다 참여 혜택과 실제 운영 플로우를 먼저 보여달라는 요청."
  },
  {
    id: "inbox-4",
    title: "브랜드 톤앤매너 워크샵 메모",
    type: "meeting",
    source: "Notion import",
    addedAt: "어제",
    tag: "Brand",
    summary: "학생 팀에게 친근하지만 성장 의지가 느껴지는 톤을 선호."
  }
];

const activity: ActivityItem[] = [
  {
    id: "act-1",
    actor: "Jaehyeok",
    action: "linked",
    target: "Campus Pilot to Partner Map",
    timeLabel: "방금 전"
  },
  {
    id: "act-2",
    actor: "Min",
    action: "updated",
    target: "Login Funnel message hierarchy",
    timeLabel: "30분 전"
  },
  {
    id: "act-3",
    actor: "Ara",
    action: "created",
    target: "Investor Update workspace room",
    timeLabel: "오늘"
  },
  {
    id: "act-4",
    actor: "System",
    action: "clustered",
    target: "3 duplicate onboarding insights",
    timeLabel: "오늘"
  }
];

const collections: WorkspaceCollection[] = [
  {
    id: "col-1",
    title: "Brand Identity",
    summary: "브랜드 방향성, 메시지, 톤앤매너 관련 노트를 모아둔 컬렉션",
    noteCount: 18,
    lead: "Min"
  },
  {
    id: "col-2",
    title: "Creator Growth",
    summary: "학생 크리에이터 획득과 활성화에 관한 실험과 리서치",
    noteCount: 24,
    lead: "Jaehyeok"
  },
  {
    id: "col-3",
    title: "Partnership Ops",
    summary: "대학, 동아리, 외부 파트너 후보와 운영 문서를 연결한 허브",
    noteCount: 11,
    lead: "Ara"
  }
];

export const workspaceSnapshot: WorkspaceSnapshot = {
  name: "LinkMind Foundry",
  tagline: "Connected product, research, and partner intelligence",
  headline: "링크, 아이디어, 프로젝트가 한 화면 안에서 이어지는 지식 운영 공간",
  focusTitle: "This week focus",
  focusSummary:
    "캠퍼스 파일럿, 로그인 퍼널 개선, 투자자 업데이트 준비가 동일한 인사이트 그래프 위에서 연결되어 있습니다.",
  heroStats: [
    {
      label: "Connected records",
      value: "128",
      detail: "notes, links, and decisions in one graph"
    },
    {
      label: "Open projects",
      value: String(projects.length),
      detail: "rooms with owners, milestones, and tasks"
    },
    {
      label: "Inbox items",
      value: String(inbox.length),
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
      value: "12",
      detail: "validation items across onboarding and partnership"
    },
    {
      label: "Warm partner leads",
      value: "9",
      detail: "schools and clubs with actionable next steps"
    },
    {
      label: "Task completion",
      value: "71%",
      detail: "rolling 7-day delivery rate"
    }
  ],
  collections,
  graphNodes,
  inbox,
  projects,
  activity
};

export function getWorkspaceSnapshot() {
  return workspaceSnapshot;
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug) ?? null;
}

export function getGraphNodesByProject(slug: string) {
  const project = getProjectBySlug(slug);

  if (!project) {
    return [];
  }

  return graphNodes.filter((node) => project.relatedNodeIds.includes(node.id));
}

