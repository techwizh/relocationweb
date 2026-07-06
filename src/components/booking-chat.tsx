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
    <div className="motion-card flex h-[32rem] flex-col overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-lg shadow-teal-900/5">
      <div className="border-b border-teal-100 bg-gradient-to-r from-teal-700 to-cyan-700 px-4 py-4 text-white">
        <h2 className="font-semibold">Move chat</h2>
        <p className="text-xs text-teal-100">
          Phone numbers, digit-by-digit messages, and number words (e.g. &quot;seven&quot;)
          are blocked to keep communication on Relocate.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-teal-50/30 to-white px-4 py-4">
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
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isMine
                    ? "ml-auto bg-gradient-to-br from-teal-600 to-cyan-600 text-white"
                    : "border border-teal-100 bg-white text-slate-800"
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

      <form onSubmit={handleSubmit} className="border-t border-teal-100 bg-teal-50/50 p-4">
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
            className="flex-1 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
          <button
            type="submit"
            disabled={isSending}
            className="motion-button rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-teal-800 hover:to-cyan-800 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
