"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { clearToken, getToken } from "@/lib/storage";

type Conv = { id:number; started_at:string };

export default function Sidebar() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const authed = Boolean(getToken());

  useEffect(() => {
    if (!authed) return;
    apiGet<{ items: any[] }>("/conversations")
      .then((r) => setConvs((r.items || []).map((x:any)=>({ id:x.id, started_at:x.started_at }))))
      .catch(() => setConvs([]));
  }, [authed, pathname]);

  const activeId = (() => {
    const m = pathname?.match(/\/chats\/(\d+)/);
    return m ? Number(m[1]) : null;
  })();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="dot" /> Rangs AI • HR
      </div>

      {authed && (
        <div className="side-actions">
          <Link href="/chats" className="btn btn-primary">+ New chat</Link>
          <button
            className="btn btn-danger"
            onClick={() => { clearToken(); router.push("/login"); }}
          >
            Logout
          </button>
        </div>
      )}

      <div className="chat-list">
        {!authed && (
          <div style={{padding:"10px", color:"var(--muted)"}}>
            Please <Link href="/login" className="btn btn-primary" style={{marginLeft:6}}>Login</Link>
          </div>
        )}
        {authed && convs.length === 0 && (
          <div style={{padding:"10px", color:"var(--muted)"}}>
            No conversations yet.
          </div>
        )}
        {authed && convs.map((c) => (
          <Link
            key={c.id}
            href={`/chats/${c.id}`}
            className={`chat-item ${activeId === c.id ? "active" : ""}`}
          >
            <div className="line1">Chat #{c.id}</div>
            <div className="line2">{new Date(c.started_at).toLocaleString()}</div>
          </Link>
        ))}
      </div>

      <div className="side-footer">
        <a className="btn" href="https://rangsgroup.com" target="_blank">Help</a>
        <a className="btn" href="mailto:support.it@rangsgroup.com">Support</a>
      </div>
    </aside>
  );
}
