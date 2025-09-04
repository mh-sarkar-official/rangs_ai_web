"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [emp, setEmp] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await login(emp, pwd);
      router.replace("/chats");
    } catch (e:any) {
      setErr(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center-wrap">
      <form className="card" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        <div className="field">
          <label>Employee ID</label>
          <input className="input" value={emp} onChange={(e)=>setEmp(e.target.value)} placeholder="RML-01350" />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} />
        </div>
        {err && <div style={{color:"salmon", marginTop:6}}>{err}</div>}
        <div style={{display:"flex", gap:10, marginTop:12}}>
          <button className="btn btn-primary" disabled={busy}>{busy ? "…" : "Login"}</button>
          <a className="btn" href="mailto:support@rangsgroup.com">Need help?</a>
        </div>
      </form>
    </div>
  );
}
