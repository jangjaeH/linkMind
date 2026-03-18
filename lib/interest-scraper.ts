import { db } from "@/lib/db";

type InterestRecord = {
  id: string;
  keyword: string;
  prompt_hint: string;
};

type ScrapeCandidate = {
  title: string;
  source: string;
  sourceUrl: string;
  summary: string;
  relevanceReason: string;
  publishedAt: Date | null;
};

const FALLBACK_LIBRARY: Record<string, ScrapeCandidate[]> = {
  "creator economy": [
    {
      title: "Creator communities are shifting from audience size to retention loops",
      source: "Fallback Digest",
      sourceUrl: "https://example.com/creator-retention-loops",
      summary: "커뮤니티 리텐션과 반복 참여 설계를 중심으로 크리에이터 생태계가 재정리되고 있다는 요약입니다.",
      relevanceReason: "LinkMind의 커뮤니티 확장 실험과 직접적으로 연결됩니다.",
      publishedAt: new Date()
    }
  ],
  "campus startup": [
    {
      title: "University startup clubs are becoming distribution channels",
      source: "Fallback Digest",
      sourceUrl: "https://example.com/university-startup-clubs",
      summary: "대학 동아리와 학내 커뮤니티가 초기 사용자를 모으는 실질 채널로 작동하는 흐름을 정리합니다.",
      relevanceReason: "캠퍼스 파일럿과 파트너십 운영 방향에 바로 참고할 수 있습니다.",
      publishedAt: new Date()
    }
  ],
  "product onboarding": [
    {
      title: "Onboarding wins come from narrowing the first value moment",
      source: "Fallback Digest",
      sourceUrl: "https://example.com/onboarding-first-value",
      summary: "가입 이후 첫 가치 인지 지점을 더 빠르게 보여주는 제품이 활성화율을 높인다는 내용입니다.",
      relevanceReason: "로그인 퍼널 개선 프로젝트의 실험 가설과 맞닿아 있습니다.",
      publishedAt: new Date()
    }
  ]
};

function stripHtml(value: string) {
  const withoutCdata = value.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
  const decoded = decodeEntities(withoutCdata);

  return decodeEntities(decoded.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(xml: string, tag: string) {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
  return xml.match(regex)?.[1]?.trim() ?? "";
}

function parseGoogleNewsRss(xml: string, keyword: string): ScrapeCandidate[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return items.slice(0, 6).map((item) => {
    const title = stripHtml(extractTag(item, "title"));
    const link = stripHtml(extractTag(item, "link"));
    const description = stripHtml(extractTag(item, "description"));
    const pubDate = stripHtml(extractTag(item, "pubDate"));
    const source = stripHtml(extractTag(item, "source")) || "Google News";

    return {
      title,
      source,
      sourceUrl: link,
      summary: description || `${keyword} 관련 최신 기사 요약입니다.`,
      relevanceReason: `${keyword} 관심사에 맞는 최신 뉴스로 분류되었습니다.`,
      publishedAt: pubDate ? new Date(pubDate) : null
    };
  });
}

async function fetchCandidates(keyword: string, promptHint: string) {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
    const response = await fetch(url, {
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();
    const parsed = parseGoogleNewsRss(xml, keyword);

    if (parsed.length > 0) {
      return parsed.map((item) => ({
        ...item,
        relevanceReason: promptHint
          ? `${promptHint} ${item.relevanceReason}`
          : item.relevanceReason
      }));
    }
  } catch (_error) {
    // Fall back to local data so the feature remains testable.
  }

  return (
    FALLBACK_LIBRARY[keyword.toLowerCase()] ?? [
      {
        title: `${keyword} trend snapshot`,
        source: "Fallback Digest",
        sourceUrl: `https://example.com/${encodeURIComponent(keyword)}`,
        summary: `${keyword} 관련 외부 수집이 실패해서 로컬 테스트용 요약을 대신 제공합니다.`,
        relevanceReason: promptHint || `${keyword} 관심사 검증용 fallback 데이터입니다.`,
        publishedAt: new Date()
      }
    ]
  );
}

export async function getInterests(workspaceSlug = "linkmind-foundry") {
  const result = await db.query<{
    id: string;
    keyword: string;
    prompt_hint: string;
    is_active: boolean;
    created_at: string;
  }>(
    `
      SELECT i.id, i.keyword, i.prompt_hint, i.is_active, i.created_at::text
      FROM interests i
      JOIN workspaces w ON w.id = i.workspace_id
      WHERE w.slug = $1
      ORDER BY i.created_at ASC
    `,
    [workspaceSlug]
  );

  return result.rows;
}

export async function getScrapedItems(workspaceSlug = "linkmind-foundry") {
  const result = await db.query<{
    id: string;
    keyword: string;
    title: string;
    source: string;
    source_url: string | null;
    summary: string;
    relevance_reason: string;
    published_label: string | null;
  }>(
    `
      SELECT
        s.id,
        i.keyword,
        s.title,
        s.source,
        s.source_url,
        s.summary,
        s.relevance_reason,
        CASE
          WHEN s.published_at IS NULL THEN NULL
          ELSE to_char(s.published_at, 'MM"월 "DD"일" HH24:MI')
        END AS published_label
      FROM scraped_items s
      JOIN workspaces w ON w.id = s.workspace_id
      LEFT JOIN interests i ON i.id = s.interest_id
      WHERE w.slug = $1
      ORDER BY COALESCE(s.published_at, s.created_at) DESC, s.created_at DESC
      LIMIT 24
    `,
    [workspaceSlug]
  );

  return result.rows.map((row) => ({
    ...row,
    keyword: stripHtml(row.keyword),
    title: stripHtml(row.title),
    source: stripHtml(row.source),
    source_url: row.source_url ? decodeEntities(row.source_url) : null,
    summary: stripHtml(row.summary),
    relevance_reason: stripHtml(row.relevance_reason)
  }));
}

export async function createInterest(input: {
  workspaceSlug?: string;
  username?: string;
  keyword: string;
  promptHint?: string;
}) {
  const workspaceSlug = input.workspaceSlug ?? "linkmind-foundry";
  const username = input.username ?? "system";
  const result = await db.query<{
    id: string;
    keyword: string;
    prompt_hint: string;
    is_active: boolean;
  }>(
    `
      INSERT INTO interests (workspace_id, user_id, keyword, prompt_hint)
      SELECT w.id, u.id, $3, $4
      FROM workspaces w
      JOIN users u ON u.username = $2
      WHERE w.slug = $1
      ON CONFLICT (workspace_id, keyword)
      DO UPDATE SET prompt_hint = EXCLUDED.prompt_hint, is_active = TRUE
      RETURNING id, keyword, prompt_hint, is_active
    `,
    [workspaceSlug, username, input.keyword.trim(), input.promptHint?.trim() ?? ""]
  );

  return result.rows[0];
}

export async function runInterestScrape(workspaceSlug = "linkmind-foundry") {
  const interestResult = await db.query<InterestRecord>(
    `
      SELECT i.id, i.keyword, i.prompt_hint
      FROM interests i
      JOIN workspaces w ON w.id = i.workspace_id
      WHERE w.slug = $1 AND i.is_active = TRUE
      ORDER BY i.created_at ASC
    `,
    [workspaceSlug]
  );

  const interests = interestResult.rows;
  let storedCount = 0;

  for (const interest of interests) {
    const candidates = await fetchCandidates(interest.keyword, interest.prompt_hint);

    for (const item of candidates) {
      const result = await db.query<{ id: string }>(
        `
          INSERT INTO scraped_items (
            workspace_id,
            interest_id,
            title,
            source,
            source_url,
            summary,
            relevance_reason,
            published_at
          )
          SELECT
            w.id,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
          FROM workspaces w
          WHERE w.slug = $1
          ON CONFLICT (interest_id, title) DO NOTHING
          RETURNING id
        `,
        [
          workspaceSlug,
          interest.id,
          item.title,
          item.source,
          item.sourceUrl,
          item.summary,
          item.relevanceReason,
          item.publishedAt
        ]
      );

      if (result.rowCount) {
        storedCount += 1;
      }
    }
  }

  return {
    interestCount: interests.length,
    storedCount,
    items: await getScrapedItems(workspaceSlug)
  };
}
