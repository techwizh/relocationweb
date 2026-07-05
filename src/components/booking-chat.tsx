"use client";

import { useEffect, useState } from "react";
import { PHONE_BLOCKED_MESSAGE } from "@/lib/chat-filter";

type ChatMessage = {
  id: string;
  senderRole: "CUSTOMER" | "DRIVER" | "ADMIN";
  senderName: string;
  body: string;
  createdAt: string;
};

type BookingChatProps = {
  bookingId: string;
  role: "CUSTOMER" | "DRIVER";
  senderName: string;
};

export function BookingChat({ bookingId, role, senderName }: BookingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function loadMessages() {
    const response = await fetch(`/api/bookings/${bookingId}/messages`);
    if (!response.ok) return;

    const data = (await response.json()) as { messages: ChatMessage[] };
    setMessages(data.messages);
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [bookingId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSending(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, senderRole: role, senderName }),
      });

      const data = (await response.json()) as {
        message?: ChatMessage;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? PHONE_BLOCKED_MESSAGE);
        return;
      }

      setBody("");
      if (data.message) {
        setMessages((current) => [...current, data.message!]);
      } else {
        await loadMessages();
      }
    } catch {
      setError("Could not send message. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[32rem] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold text-slate-900">Move chat</h2>
        <p className="text-xs text-slate-500">
          Phone numbers, digit-by-digit messages, and number words (e.g. &quot;seven&quot;)
          are blocked to keep communication on Relocate.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">
            No messages yet. Ask about access, parking, or loading details.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderRole === role;

            return (
              <article
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  isMine
                    ? "ml-auto bg-teal-700 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="mb-1 text-xs font-semibold opacity-80">
                  {message.senderName} · {message.senderRole.toLowerCase()}
                </p>
                <p>{message.body}</p>
              </article>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4">
        {error ? (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-teal-700 focus:ring-2"
          />
          <button
            type="submit"
            disabled={isSending}
            className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
