"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import TypingBubble from "@/components/TypingBubble";

type HistoryMsg = { role: string; content_md: string; created_at: string };
type UiMsg = { role: "user" | "assistant"; content: string; t?: string };

export default function ChatUI({ conversationId }: { conversationId?: number }) {
  const [msgs, setMsgs] = useState<UiMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- smooth busy: keep visible >= 400ms so users notice the typing bubble ---
  const busyStart = useRef(0);
  const setBusySmooth = (val: boolean) => {
    if (val) {
      busyStart.current = performance.now();
      setBusy(true);
    } else {
      const dt = performance.now() - busyStart.current;
      const left = Math.max(0, 400 - dt);
      setTimeout(() => setBusy(false), left);
    }
  };

  // Load history when resuming
  useEffect(() => {
    if (!conversationId) return;
    apiGet<{ messages: HistoryMsg[] }>(`/conversations/${conversationId}/messages`)
      .then((r) => {
        const mapped: UiMsg[] = (r.messages || []).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content_md || "",
          t: new Date(m.created_at).toLocaleString(),
        }));
        setMsgs(mapped);
        requestAnimationFrame(() => {
          scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "instant" as any });
        });
      })
      .catch(() => setMsgs([]));
  }, [conversationId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;

    setBusySmooth(true);
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setInput("");

    try {
      const res = await apiPost<{ text: string; answer?: string; conversation_id?: number; turn_index?: number; }>(
        "/ask",
        { question: q, language: "auto" },
        conversationId
      );

      const reply = res.answer || res.text || "";
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);

      if (!conversationId && res.conversation_id) {
        setTimeout(() => router.replace(`/chats/${res.conversation_id}`), 80);
      }
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Sorry — request failed." }]);
    } finally {
      setBusySmooth(false);
    }
  };

  return (
    <div className="chat-shell">
      <div className="chat-header">
        <div className="chat-title">Assistant</div>
        <div className="status">
          <span className={`dot${busy ? " busy" : ""}`} />
          {conversationId ? `Conversation #${conversationId}` : "New chat"}
        </div>
      </div>

      <div className="messages" ref={scroller}>
        {msgs.length === 0 && (
          <div className="empty">
            Say hi 👋 — your first message will start a new conversation.
          </div>
        )}

        {msgs.map((m, i) => (
          <article key={i} className={`bubble ${m.role}`}>
            <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, "<br/>") }} />
            {m.t && <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>{m.t}</div>}
          </article>
        ))}

        {busy && <TypingBubble />}
      </div>

      <div className="composer">
        <textarea
          className="composer-input"
          placeholder="Type your question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          disabled={busy}
        />
        <button className="send-btn" onClick={send} disabled={busy || !input.trim()}>
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
