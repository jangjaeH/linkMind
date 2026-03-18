INSERT INTO interests (workspace_id, user_id, keyword, prompt_hint)
SELECT
  w.id,
  u.id,
  data.keyword,
  data.prompt_hint
FROM workspaces w
JOIN users u ON u.username = 'system'
JOIN (
  VALUES
    ('creator economy', '학생 크리에이터와 커뮤니티 성장 사례를 우선적으로 본다.'),
    ('campus startup', '대학 기반 창업, 파트너십, 커뮤니티 운영 사례를 본다.'),
    ('product onboarding', '초기 활성화와 로그인 퍼널 개선 사례를 본다.')
) AS data(keyword, prompt_hint) ON TRUE
WHERE w.slug = 'linkmind-foundry'
ON CONFLICT (workspace_id, keyword) DO NOTHING;

