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
              현재는 빠르게 확인 가능한 데모 로그인으로 구현해두었고, 이후 Supabase, Auth.js,
              Firebase 같은 실제 인증 시스템으로 교체하기 쉽도록 쿠키와 사용자 타입 구조를 먼저
              만들어 두었습니다.
            </p>
            <ul className="check-list">
              {loginHints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>

          <div className="login-panel">
            <div className="login-panel__header">
              <span>Sign in</span>
              <small>Demo credentials work with any password</small>
            </div>
            <LoginForm />
          </div>
        </div>
      </section>
    </div>
  );
}

