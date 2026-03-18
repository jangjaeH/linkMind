import { LoginForm } from "@/components/login-form";
import { loginHints } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="page">
      <section className="section login-section">
        <div className="container login-layout">
          <div className="login-copy">
            <span className="eyebrow">Authentication-ready</span>
            <h1>팀 로그인 구조를 고려한 LinkMind 진입 화면</h1>
            <p>
              이제는 Docker Postgres 위에 실제 로그인과 회원가입이 연결됩니다. 기본 테스트 계정은
              `system / 1234`로 바로 확인할 수 있고, 새 계정도 직접 생성할 수 있습니다.
            </p>
            <ul className="check-list">
              {loginHints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>

          <div className="login-panel">
            <div className="login-panel__header">
              <span>Auth</span>
              <small>Test account: system / 1234</small>
            </div>
            <LoginForm />
          </div>
        </div>
      </section>
    </div>
  );
}
