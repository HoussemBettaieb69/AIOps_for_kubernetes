import { useState } from "react";

export default function AIChatWindow({ mode = "general", onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Cluster is stable. You can ask about incidents, pods, or system behavior.",
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { role: "user", text: input },
      {
        role: "assistant",
        text: "Analyzing... (connect this to your AI agent later)",
      },
    ]);

    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-6 w-[420px] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <h2 className="font-semibold text-sm text-blue-400 flex items-center gap-2">
          AI Assistant
        </h2>

        <div className="flex items-center gap-2">
          {mode === "alert" && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
              Incident #42 context
            </span>
          )}

          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white"
          >
            Hide
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[300px]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              msg.role === "user"
                ? "bg-blue-500/20 text-blue-300 ml-auto"
                : "bg-neutral-800 text-neutral-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "alert"
              ? "Ask about this incident..."
              : "Ask anything..."
          }
          className="flex-1 bg-neutral-800 text-sm px-3 py-2 rounded outline-none text-white"
        />

        <button
          onClick={handleSend}
          className="bg-blue-500 px-4 rounded text-sm font-medium hover:bg-blue-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}