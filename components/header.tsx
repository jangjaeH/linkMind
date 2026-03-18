"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

const links = [
  { href: "/", label: "Overview" },
  { href: "/workspace", label: "Workspace" },
  { href: "/login", label: "Login" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" href="/">
          <span className="brand__mark">LM</span>
          <span>
            LinkMind
            <small>Knowledge-driven product workspace</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => (
            // Keep the workspace tab active on nested workspace routes.
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href ||
                (link.href === "/workspace" && pathname.startsWith("/workspace/"))
                  ? "is-active"
                  : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          {isAuthenticated && user ? (
            <>
              <span className="user-chip">
                {user.name}
                <small>{user.role}</small>
              </span>
              <button
                className="ghost-button"
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                  router.refresh();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="ghost-button" href="/login">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
