"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type InterestManagerProps = {
  initialInterests: Array<{
    id: string;
    keyword: string;
    prompt_hint: string;
    is_active: boolean;
  }>;
};

export function InterestManager({ initialInterests }: InterestManagerProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [promptHint, setPromptHint] = useState("");
  const [message, setMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsWorking(true);

    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ keyword, promptHint })
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "관심사를 저장하지 못했습니다.");
        return;
      }

      setKeyword("");
      setPromptHint("");
      setMessage("관심사를 저장했습니다.");
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setIsWorking(false);
    }
  };

  const onScrape = async () => {
    setMessage("스크랩 실행 중...");
    setIsWorking(true);

    try {
      const response = await fetch("/api/interests/scrape", {
        method: "POST"
      });

      const data = (await response.json()) as { storedCount?: number };

      if (!response.ok) {
        setMessage("스크랩 실행에 실패했습니다.");
        return;
      }

      setMessage(`${data.storedCount ?? 0}개의 새 결과를 저장했습니다.`);
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="interest-manager">
      <div className="inbox-card">
        <div className="inbox-card__meta">
          <span className="badge">Active interests</span>
          <span>{initialInterests.length} tracked</span>
        </div>
        <p>키워드와 관점을 함께 적어두면 스크랩 결과를 LinkMind 문맥에 맞게 더 잘 정리할 수 있습니다.</p>
      </div>

      <form className="interest-form" onSubmit={(event) => void onCreate(event)}>
        <label>
          <span>Interest keyword</span>
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="creator economy"
          />
        </label>

        <label>
          <span>Prompt hint</span>
          <input
            type="text"
            value={promptHint}
            onChange={(event) => setPromptHint(event.target.value)}
            placeholder="어떤 관점으로 볼지 적어주세요"
          />
        </label>

        <div className="interest-form__actions">
          <button className="primary-button" type="submit" disabled={isPending || isWorking}>
            Add interest
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() => void onScrape()}
            disabled={isPending || isWorking}
          >
            Run scrape
          </button>
        </div>
      </form>

      {message ? <p className="interest-message">{message}</p> : null}

      <div className="tag-row">
        {initialInterests.map((interest) => (
          <span key={interest.id} className="tag">
            {interest.keyword}
          </span>
        ))}
      </div>
    </div>
  );
}
