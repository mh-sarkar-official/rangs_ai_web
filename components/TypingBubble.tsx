"use client";

export default function TypingBubble() {
  return (
    <article className="bubble assistant typing" aria-live="polite" aria-label="Assistant is typing">
      <div className="typing-row">
        <span className="spinner" aria-hidden="true" />
        <span className="typing-text">Assistant is typing</span>
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="typing-skeleton" aria-hidden="true">
        <div className="sk-line"></div>
        <div className="sk-line"></div>
        <div className="sk-line short"></div>
      </div>
    </article>
  );
}
