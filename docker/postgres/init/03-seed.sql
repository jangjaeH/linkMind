INSERT INTO users (username, email, full_name, password_hash, role)
VALUES
  ('system', 'system@linkmind.ai', 'System User', crypt('1234', gen_salt('bf')), 'founder'),
  ('jaehyeok', 'hello@linkmind.ai', 'Jaehyeok', crypt('1234', gen_salt('bf')), 'founder'),
  ('min', 'min@linkmind.ai', 'Min', crypt('1234', gen_salt('bf')), 'team'),
  ('ara', 'ara@linkmind.ai', 'Ara', crypt('1234', gen_salt('bf')), 'team')
ON CONFLICT (username) DO NOTHING;

INSERT INTO workspaces (slug, name, description)
VALUES ('linkmind-foundry', 'LinkMind Foundry', 'Connected product, research, and partner intelligence')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO workspace_memberships (workspace_id, user_id, role)
SELECT w.id, u.id, CASE WHEN u.role = 'founder' THEN 'owner' ELSE 'editor' END
FROM workspaces w
JOIN users u ON u.email IN ('system@linkmind.ai', 'hello@linkmind.ai', 'min@linkmind.ai', 'ara@linkmind.ai')
WHERE w.slug = 'linkmind-foundry'
ON CONFLICT (workspace_id, user_id) DO NOTHING;

INSERT INTO collections (workspace_id, title, summary, lead_user_id)
SELECT
  w.id,
  data.title,
  data.summary,
  u.id
FROM workspaces w
JOIN (
  VALUES
    ('Brand Identity', '브랜드 방향성과 메시지를 모아둔 컬렉션', 'min@linkmind.ai'),
    ('Creator Growth', '학생 크리에이터 성장 실험과 리서치 허브', 'hello@linkmind.ai'),
    ('Partnership Ops', '대학 및 동아리 파트너 운영 컬렉션', 'ara@linkmind.ai')
) AS data(title, summary, email) ON TRUE
JOIN users u ON u.email = data.email
WHERE w.slug = 'linkmind-foundry'
ON CONFLICT DO NOTHING;

INSERT INTO tags (workspace_id, name)
SELECT w.id, data.name
FROM workspaces w
JOIN (
  VALUES ('Community'), ('Auth'), ('Partner'), ('Brand'), ('Onboarding')
) AS data(name) ON TRUE
WHERE w.slug = 'linkmind-foundry'
ON CONFLICT (workspace_id, name) DO NOTHING;

INSERT INTO sources (workspace_id, source_type, title, url)
SELECT
  w.id,
  data.source_type,
  data.title,
  data.url
FROM workspaces w
JOIN (
  VALUES
    ('web', '학생 창업 동아리 커뮤니티 운영 사례', 'https://example.com/community'),
    ('interview', '가입 직후 이탈 사용자 인터뷰 요약', NULL),
    ('slack', '대학 파트너십 제안서 업데이트 요청', NULL),
    ('notion', '브랜드 톤앤매너 워크샵 메모', NULL)
) AS data(source_type, title, url) ON TRUE
WHERE w.slug = 'linkmind-foundry'
ON CONFLICT DO NOTHING;

INSERT INTO notes (workspace_id, collection_id, source_id, title, summary, note_type, status, created_by)
SELECT
  w.id,
  c.id,
  s.id,
  data.title,
  data.summary,
  data.note_type,
  data.status,
  u.id
FROM workspaces w
JOIN (
  VALUES
    ('Creator Growth', '학생 창업 동아리 커뮤니티 운영 사례', '학생 크리에이터 커뮤니티의 성장 루프와 인센티브 구조를 정리한 링크.', 'link', 'captured', 'hello@linkmind.ai', '학생 창업 동아리 커뮤니티 운영 사례'),
    ('Creator Growth', '가입 직후 이탈 사용자 인터뷰 요약', '초기 가치 제안이 늦게 보이고 입력 피로가 높다는 인터뷰 메모.', 'research', 'linked', 'hello@linkmind.ai', '가입 직후 이탈 사용자 인터뷰 요약'),
    ('Partnership Ops', '대학 파트너십 제안서 업데이트 요청', '참여 혜택과 운영 플로우를 제안서 앞부분에 배치해야 한다는 요청.', 'task', 'triaged', 'ara@linkmind.ai', '대학 파트너십 제안서 업데이트 요청'),
    ('Brand Identity', '브랜드 톤앤매너 워크샵 메모', '친근하지만 성장 욕구를 자극하는 톤을 유지한다는 내부 합의.', 'meeting', 'linked', 'min@linkmind.ai', '브랜드 톤앤매너 워크샵 메모')
) AS data(collection_title, title, summary, note_type, status, email, source_title) ON TRUE
JOIN collections c ON c.workspace_id = w.id AND c.title = data.collection_title
JOIN sources s ON s.workspace_id = w.id AND s.title = data.source_title
JOIN users u ON u.email = data.email
WHERE w.slug = 'linkmind-foundry'
  AND NOT EXISTS (
    SELECT 1
    FROM notes n
    WHERE n.workspace_id = w.id AND n.title = data.title
  );

INSERT INTO note_tags (note_id, tag_id)
SELECT n.id, t.id
FROM notes n
JOIN workspaces w ON w.id = n.workspace_id
JOIN (
  VALUES
    ('학생 창업 동아리 커뮤니티 운영 사례', 'Community'),
    ('가입 직후 이탈 사용자 인터뷰 요약', 'Auth'),
    ('가입 직후 이탈 사용자 인터뷰 요약', 'Onboarding'),
    ('대학 파트너십 제안서 업데이트 요청', 'Partner'),
    ('브랜드 톤앤매너 워크샵 메모', 'Brand')
) AS data(note_title, tag_name) ON data.note_title = n.title
JOIN tags t ON t.workspace_id = w.id AND t.name = data.tag_name
ON CONFLICT DO NOTHING;

INSERT INTO graph_nodes (workspace_id, note_id, label, kind, summary, strength)
SELECT
  w.id,
  n.id,
  data.label,
  data.kind,
  data.summary,
  data.strength
FROM workspaces w
JOIN (
  VALUES
    ('Brand Club', 'idea', 'Student creator community concept that anchors the referral loop.', 92, NULL),
    ('Campus Pilot', 'project', 'First structured onboarding experiment for university creator teams.', 84, '대학 파트너십 제안서 업데이트 요청'),
    ('Creator Research', 'research', 'Interviews and drop-off analysis around onboarding motivation.', 78, '가입 직후 이탈 사용자 인터뷰 요약'),
    ('Partner Map', 'partner', 'University and club partnership shortlist with warm intros.', 66, NULL),
    ('Login Funnel', 'project', 'Authentication flow cleanup to reduce friction before activation.', 88, '가입 직후 이탈 사용자 인터뷰 요약'),
    ('Growth Loop', 'idea', 'Invite, share, and collaboration mechanism tied to activation.', 73, '학생 창업 동아리 커뮤니티 운영 사례')
) AS data(label, kind, summary, strength, note_title) ON TRUE
LEFT JOIN notes n ON n.workspace_id = w.id AND n.title = data.note_title
WHERE w.slug = 'linkmind-foundry'
  AND NOT EXISTS (
    SELECT 1
    FROM graph_nodes g
    WHERE g.workspace_id = w.id AND g.label = data.label
  );

INSERT INTO graph_edges (workspace_id, from_node_id, to_node_id, relation_type)
SELECT
  w.id,
  from_node.id,
  to_node.id,
  data.relation_type
FROM workspaces w
JOIN (
  VALUES
    ('Creator Research', 'Login Funnel', 'supports'),
    ('Campus Pilot', 'Partner Map', 'depends_on'),
    ('Brand Club', 'Growth Loop', 'inspires'),
    ('Creator Research', 'Campus Pilot', 'supports')
) AS data(from_label, to_label, relation_type) ON TRUE
JOIN graph_nodes from_node ON from_node.workspace_id = w.id AND from_node.label = data.from_label
JOIN graph_nodes to_node ON to_node.workspace_id = w.id AND to_node.label = data.to_label
WHERE w.slug = 'linkmind-foundry'
ON CONFLICT DO NOTHING;

INSERT INTO projects (workspace_id, slug, name, stage, objective, summary, owner_user_id, progress_label)
SELECT
  w.id,
  data.slug,
  data.name,
  data.stage,
  data.objective,
  data.summary,
  u.id,
  data.progress_label
FROM workspaces w
JOIN (
  VALUES
    ('campus-pilot', 'Campus Pilot', 'Execution', '3개 대학 파트너와 온보딩 실험을 돌려 활성화율 35%를 검증한다.', '대학교 크리에이터 커뮤니티 대상 첫 파트너십 파일럿을 설계하고 실행합니다.', 'hello@linkmind.ai', '68% aligned'),
    ('login-funnel', 'Login Funnel Refinement', 'Discovery', '가입 완료 후 첫 가치 인지까지의 시간을 3분 이하로 줄인다.', '이메일 인증과 첫 워크스페이스 진입 사이의 이탈 구간을 줄이는 작업입니다.', 'hello@linkmind.ai', '41% aligned'),
    ('investor-update', 'Investor Update', 'Planning', '한 장 요약만 봐도 제품 방향성과 실행력이 이해되도록 만든다.', '트랙션, 인사이트, 다음 라운드 대비 핵심 내러티브를 정리합니다.', 'ara@linkmind.ai', '24% aligned')
) AS data(slug, name, stage, objective, summary, email, progress_label) ON TRUE
JOIN users u ON u.email = data.email
WHERE w.slug = 'linkmind-foundry'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO project_tags (project_id, tag_id)
SELECT p.id, t.id
FROM projects p
JOIN workspaces w ON w.id = p.workspace_id
JOIN (
  VALUES
    ('campus-pilot', 'Partner'),
    ('campus-pilot', 'Onboarding'),
    ('login-funnel', 'Auth'),
    ('login-funnel', 'Onboarding'),
    ('investor-update', 'Brand')
) AS data(project_slug, tag_name) ON data.project_slug = p.slug
JOIN tags t ON t.workspace_id = w.id AND t.name = data.tag_name
ON CONFLICT DO NOTHING;

INSERT INTO project_nodes (project_id, graph_node_id)
SELECT p.id, g.id
FROM projects p
JOIN workspaces w ON w.id = p.workspace_id
JOIN (
  VALUES
    ('campus-pilot', 'Campus Pilot'),
    ('campus-pilot', 'Creator Research'),
    ('campus-pilot', 'Partner Map'),
    ('login-funnel', 'Login Funnel'),
    ('login-funnel', 'Creator Research'),
    ('login-funnel', 'Growth Loop'),
    ('investor-update', 'Brand Club'),
    ('investor-update', 'Growth Loop'),
    ('investor-update', 'Partner Map')
) AS data(project_slug, node_label) ON data.project_slug = p.slug
JOIN graph_nodes g ON g.workspace_id = w.id AND g.label = data.node_label
ON CONFLICT DO NOTHING;

INSERT INTO tasks (project_id, title, status, priority, owner_user_id, due_label)
SELECT
  p.id,
  data.title,
  data.status,
  data.priority,
  u.id,
  data.due_label
FROM projects p
JOIN (
  VALUES
    ('campus-pilot', 'Warm intro 가능한 대학 동아리 10곳 정리', 'doing', 'high', 'hello@linkmind.ai', '오늘'),
    ('campus-pilot', '파일럿 참여 페이지 카피 초안 마무리', 'todo', 'high', 'min@linkmind.ai', '내일'),
    ('campus-pilot', '참여자 인센티브 구조 검토', 'done', 'medium', 'ara@linkmind.ai', '완료'),
    ('login-funnel', '회원가입 후 빈 상태 onboarding 카드 추가', 'todo', 'high', 'hello@linkmind.ai', '이번 주'),
    ('login-funnel', '이메일 인증 대기 화면 메시지 개선', 'doing', 'medium', 'min@linkmind.ai', '목요일'),
    ('investor-update', '활성 사용자와 재방문 지표 정리', 'todo', 'medium', 'ara@linkmind.ai', '금요일')
) AS data(project_slug, title, status, priority, email, due_label) ON data.project_slug = p.slug
JOIN users u ON u.email = data.email
WHERE NOT EXISTS (
  SELECT 1
  FROM tasks t
  WHERE t.project_id = p.id AND t.title = data.title
);

INSERT INTO milestones (project_id, title, date_label, progress)
SELECT
  p.id,
  data.title,
  data.date_label,
  data.progress
FROM projects p
JOIN (
  VALUES
    ('campus-pilot', 'Pilot offer finalized', '3월 21일', 90),
    ('campus-pilot', 'First partner kickoff', '3월 25일', 62),
    ('login-funnel', 'Updated auth copy reviewed', '3월 20일', 50),
    ('investor-update', 'Draft narrative complete', '3월 28일', 20)
) AS data(project_slug, title, date_label, progress) ON data.project_slug = p.slug
WHERE NOT EXISTS (
  SELECT 1
  FROM milestones m
  WHERE m.project_id = p.id AND m.title = data.title
);

INSERT INTO activity_logs (workspace_id, actor_user_id, action, target, time_label)
SELECT
  w.id,
  u.id,
  data.action,
  data.target,
  data.time_label
FROM workspaces w
JOIN (
  VALUES
    ('hello@linkmind.ai', 'linked', 'Campus Pilot to Partner Map', '방금 전'),
    ('min@linkmind.ai', 'updated', 'Login Funnel message hierarchy', '30분 전'),
    ('ara@linkmind.ai', 'created', 'Investor Update workspace room', '오늘')
) AS data(email, action, target, time_label) ON TRUE
JOIN users u ON u.email = data.email
WHERE w.slug = 'linkmind-foundry'
  AND NOT EXISTS (
    SELECT 1
    FROM activity_logs a
    WHERE a.workspace_id = w.id AND a.target = data.target
  );
