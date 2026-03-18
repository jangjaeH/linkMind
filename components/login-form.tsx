"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

type AuthMode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [identifier, setIdentifier] = useState("system");
  const [password, setPassword] = useState("1234");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (mode === "login") {
      if (!identifier || !password) {
        setError("아이디 또는 이메일과 비밀번호를 모두 입력해 주세요.");
        setIsSubmitting(false);
        return;
      }

      const result = await login(identifier, password);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!username || !email || !name || !password) {
        setError("회원가입 항목을 모두 입력해 주세요.");
        setIsSubmitting(false);
        return;
      }

      const result = await signup({ username, email, name, password });

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    router.push(searchParams.get("redirect") || "/workspace");
    router.refresh();
  };

  const disabled = isLoading || isSubmitting;

  return (
    <>
      <div className="auth-toggle">
        <button
          className={mode === "login" ? "auth-toggle__button is-active" : "auth-toggle__button"}
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Sign in
        </button>
        <button
          className={mode === "signup" ? "auth-toggle__button is-active" : "auth-toggle__button"}
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
          }}
        >
          Sign up
        </button>
      </div>

      <form className="login-form" onSubmit={(event) => void onSubmit(event)}>
        {mode === "login" ? (
          <label>
            <span>ID or Email</span>
            <input
              autoComplete="username"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="system"
            />
          </label>
        ) : (
          <>
            <label>
              <span>ID</span>
              <input
                autoComplete="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your-id"
              />
            </label>
            <label>
              <span>Name</span>
              <input
                autoComplete="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                autoComplete="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </>
        )}

        <label>
          <span>Password</span>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="1234"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={disabled}>
          {mode === "login" ? "Continue to workspace" : "Create account"}
        </button>
      </form>
    </>
  );
}
