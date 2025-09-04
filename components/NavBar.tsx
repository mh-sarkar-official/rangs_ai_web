// components/NavBar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getToken()));
  }, []);

  return (
    <div className="nav">
      <div style={{ fontSize: 18 }} className="brand">Rangs AI • HR Assistant</div>
      <div className="nav-actions">
        {authed ? (
          <>
            <Link className="btn" href="/chats">Chats</Link>
            <button
              className="btn btn-danger"
              onClick={() => { clearToken(); setAuthed(false); router.push("/login"); }}
            >
              Logout
            </button>
          </>
        ) : (
          pathname !== "/login" && <Link className="btn btn-primary" href="/login">Login</Link>
        )}
      </div>
    </div>
  );
}
