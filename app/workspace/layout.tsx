import type { ReactNode } from "react";
import Link from "next/link";

import { getWorkspaceSnapshotFromDb } from "@/lib/workspace-queries";

const navItems = [
  { href: "/workspace", label: "Dashboard" },
  { href: "/workspace/inbox", label: "Inbox" },
  { href: "/workspace/graph", label: "Graph" },
  { href: "/workspace/interests", label: "Interests" }
];

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const workspace = await getWorkspaceSnapshotFromDb();

  return (
    <div className="page workspace-page">
      <section className="section workspace-shell">
        <div className="container workspace-shell__grid">
          <aside className="workspace-sidebar workspace-sidebar--nav">
            <span className="eyebrow">Workspace shell</span>
            <h2>{workspace.name}</h2>
            <p>{workspace.focusSummary}</p>

            <nav className="workspace-nav" aria-label="Workspace">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="side-panel">
              <span className="eyebrow">Collections</span>
              <ul className="feed-list">
                {workspace.collections.map((collection) => (
                  <li key={collection.id}>
                    {collection.title}
                    <small>{collection.noteCount} notes</small>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="workspace-stage">{children}</div>
        </div>
      </section>
    </div>
  );
}
