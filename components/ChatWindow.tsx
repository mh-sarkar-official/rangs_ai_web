"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import TypingBubble from "@/components/TypingBubble";

type Message = { role: "user" | "assistant"; content_md: string; created_at: string; turn_index: number; };

export default function ChatWindow({ conversationId }: { conversationId?: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // smooth sending indicator (min 400ms)
  const sendStart = useRef(0);
  const setSendingSmooth = (val: boolean) => {
    if (val) {
      sendStart.current = performance.now();
      setSending(true);
    } else {
      const dt = performance.now() - sendStart.current;
      const left = Math.max(0, 400 - dt);
      setTimeout(() => setSending(false), left);
    }
  };

  const scrollBottom = () => requestAnimationFrame(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  });

  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      const r = await apiGet<{ messages: Message[] }>(`/conversations/${conversationId}/messages`);
      setMessages(r.messages || []);
      scrollBottom();
    })();
  }, [conversationId]);

  useEffect(() => { if (sending) scrollBottom(); }, [sending]);

  const send = async () => {
    const q = text.trim();
    if (!q || sending) return;
    setSendingSmooth(true);

    const turnIndex = (messages.at(-1)?.turn_index ?? 0) + 1;

    // optimistic user bubble
    setMessages(prev => [...prev, { role:"user", content_md:q, created_at:new Date().toISOString(), turn_index:turnIndex }]);
    setText("");
    scrollBottom();

    try {
      const res = await apiPost<{ text: string; answer?: string; conversation_id?: number }>(
        "/ask", { question: q, language: "auto" }, conversationId
      );

      if (!conversationId && res?.conversation_id) {
        window.location.href = `/chats/${res.conversation_id}`;
        return;
      }

      setMessages(prev => [...prev, {
        role:"assistant",
        content_md: (res.answer || res.text || "—").toString(),
        created_at: new Date().toISOString(),
        turn_index: turnIndex + 1
      }]);
      scrollBottom();
    } catch {
      setMessages(prev => [...prev, {
        role:"assistant",
        content_md: "Sorry — request failed.",
        created_at: new Date().toISOString(),
        turn_index: (messages.at(-1)?.turn_index ?? 0) + 2
      }]);
    } finally {
      setSendingSmooth(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="chat-shell">
      <div className="chat-header">
        <div className="chat-title">Assistant</div>
        <div className="status">
          <span className={`dot${sending ? " busy" : ""}`} />
          {conversationId ? `Conversation #${conversationId}` : "New chat"}
        </div>
      </div>

      <div className="messages" ref={scroller}>
        {messages.length === 0 && (
          <div className="empty">
            Ask anything like <code>“Who is the boss of RML-01350?”</code>
          </div>
        )}

        {messages.map((m, i) => (
          <article key={i} className={`bubble ${m.role}`}>
            <div dangerouslySetInnerHTML={{ __html: (m.content_md || "").replace(/\n/g, "<br/>") }} />
          </article>
        ))}

        {sending && <TypingBubble />}
      </div>

      <div className="composer">
        <textarea
          className="composer-input"
          placeholder="Type your question…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          disabled={sending}
        />
        <button className="send-btn" onClick={send} disabled={sending || !text.trim()}>
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
