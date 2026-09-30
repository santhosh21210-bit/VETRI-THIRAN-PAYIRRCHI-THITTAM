import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Square, Zap } from "lucide-react";
import { useStore } from "../lib/store";
import { NeedProfile } from "./workouts";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach — GymFreak" },
      { name: "description", content: "Chat with your AI fitness coach for personalized training and nutrition advice." },
      { property: "og:title", content: "AI Coach — GymFreak" },
      { property: "og:description", content: "Personalized AI fitness coaching chat." },
    ],
  }),
  component: CoachPage,
});

const SUGGESTIONS = [
  "Why am I not losing weight?",
  "Build me a 30-minute home workout",
  "What should I eat after training?",
  "How do I improve my bench press?",
];

function CoachPage() {
  const { state } = useStore();
  const profile = state.profile;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { profile },
      }),
    [profile],
  );

  const { messages, sendMessage, status, stop, error } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!profile) return <NeedProfile />;

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <main className="mx-auto flex h-[calc(100vh-57px)] max-w-3xl flex-col px-4 sm:px-6">
      <div className="flex items-center gap-3 border-b border-border py-4">
        <span className="grid size-10 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
          <Zap className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold leading-none">GymFreak Coach</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" /> Online · knows your profile
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto py-6">
        {messages.length === 0 && (
          <div className="pt-8 text-center">
            <h2 className="font-display text-2xl font-bold">What are we working on, {profile.name}?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask about training, nutrition, recovery or motivation.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {m.parts.map((part, i) =>
                part.type === "text" ? (
                  m.role === "user" ? (
                    <p key={i} className="whitespace-pre-wrap">{part.text}</p>
                  ) : (
                    <div key={i} className="prose-sm prose-invert max-w-none [&_p]:my-2 [&_ul]:my-2 [&_li]:my-0.5 [&_strong]:text-foreground">
                      <ReactMarkdown>{part.text}</ReactMarkdown>
                    </div>
                  )
                ) : null,
              )}
            </div>
          </div>
        ))}

        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              <span className="animate-pulse-dot">Coach is thinking…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Something went wrong getting a reply. Please try sending your message again.
          </div>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-border py-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach…"
          className="w-full rounded-full border border-input bg-card px-5 py-3 text-sm outline-none focus:border-primary"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
            aria-label="Stop"
          >
            <Square className="size-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
            aria-label="Send"
          >
            <ArrowUp className="size-5" />
          </button>
        )}
      </form>
    </main>
  );
}
