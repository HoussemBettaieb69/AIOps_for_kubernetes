import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Send } from "lucide-react";

const STORAGE_KEY = "aiops_chat_open";

async function fetchConversations() {
  const res = await fetch("/api/conversations");
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

async function postMessage(conversationId, content) {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export default function AIChat({ alertContext = null }) {
  const [open, setOpen] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === "1",
  );
  const [activeConvId, setActiveConvId] = useState(null);
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState({});
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const qc = useQueryClient();

  // UI states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  const isMobile = window.innerWidth < 640;

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  // Persist open state
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, open ? "1" : "0");
  }, [open]);

  // Default conversation
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      const ctxConv = alertContext
        ? conversations.find((c) => c.alertId === alertContext.alertId)
        : null;

      setActiveConvId(
        ctxConv?.conversationId || conversations[0].conversationId,
      );
    }
  }, [conversations, activeConvId, alertContext]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, activeConvId]);

  // Auto focus input
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Dragging logic

  const handleMouseDown = () => {
    setIsDragging(true);
    document.body.style.userSelect = "none";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = "auto";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || isFullscreen || isMobile) return;

      setPosition((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isFullscreen, isMobile]);

  useEffect(() => {
    const saved = localStorage.getItem("chat_position");
    if (saved) setPosition(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_position", JSON.stringify(position));
  }, [position]);

  const sendMutation = useMutation({
    mutationFn: ({ convId, content }) => postMessage(convId, content),

    onMutate: ({ convId, content }) => {
      const userMsg = {
        messageId: `tmp-${Date.now()}`,
        sender: "user",
        content,
        timestamp: new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setLocalMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || getBaseMessages(convId)), userMsg],
      }));
    },

    onSuccess: (aiReply, { convId }) => {
      setLocalMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), aiReply],
      }));
    },
  });

  const getBaseMessages = (convId) =>
    conversations.find((c) => c.conversationId === convId)?.messages || [];

  const activeConv = conversations.find(
    (c) => c.conversationId === activeConvId,
  );

  const messages = localMessages[activeConvId] || activeConv?.messages || [];

  const isAlertCtx =
    alertContext && activeConv?.alertId === alertContext?.alertId;

  const handleSend = () => {
    if (!input.trim() || !activeConvId) return;
    sendMutation.mutate({ convId: activeConvId, content: input.trim() });
    setInput("");
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-lg z-50 transition-transform hover:scale-110 active:scale-95"
          style={{
            background:
              isAlertCtx || alertContext
                ? "linear-gradient(135deg, #c0392b, #e74c3c)"
                : "linear-gradient(135deg, #2563eb, #4f8ef7)",
          }}
        >
          AI
        </button>
      )}

      {open && (
        <div
          className="fixed flex flex-col shadow-2xl z-50 overflow-hidden transition-all duration-300"
          style={{
            top: isMobile ? 0 : isFullscreen ? 0 : position.y,
            left: isMobile ? 0 : isFullscreen ? 0 : position.x,
            width: isMobile
              ? "100vw"
              : isFullscreen
                ? "100vw"
                : "clamp(320px, 35vw, 520px)",
            height: isMobile
              ? "100vh"
              : isFullscreen
                ? "100vh"
                : "clamp(400px, 65vh, 700px)",
            borderRadius: isMobile || isFullscreen ? "0px" : "12px",
            resize: isFullscreen || isMobile ? "none" : "both",
            minWidth: "300px",
            minHeight: "400px",
            maxWidth: "95vw",
            maxHeight: "95vh",
            background: "#161923",
            border: "1px solid #1e2535",
          }}
        >
          {/* Header */}
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between px-4 py-3 cursor-move select-none"
            style={{ borderBottom: "1px solid #1e2535" }}
          >
            <span className="text-white font-semibold text-sm">
              AI Assistant
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="text-[#4a5568] hover:text-white"
              >
                {isFullscreen ? "🗗" : "🗖"}
              </button>

              <button
                onClick={() => setOpen(false)}
                className="text-[#4a5568] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div
              className="w-44 flex flex-col py-2 overflow-y-auto"
              style={{ borderRight: "1px solid #1e2535" }}
            >
              <p className="text-[10px] text-[#4a5568] uppercase px-3 pb-1">
                History
              </p>

              {conversations.map((c) => (
                <button
                  key={c.conversationId}
                  onClick={() => setActiveConvId(c.conversationId)}
                  className={`text-left px-3 py-2 rounded-md mx-1 ${
                    c.conversationId === activeConvId
                      ? "bg-[#1e2d4f] text-white"
                      : "text-[#6b7a99] hover:text-white hover:bg-[#1a2030]"
                  }`}
                >
                  <p className="text-[clamp(11px,0.8vw,13px)]  font-medium truncate">{c.title}</p>
                  <p className="text-[clamp(10px,0.7vw,12px)] text-[#4a5568] truncate">
                    {c.subtitle}
                  </p>
                </button>
              ))}
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
                {messages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] break-words whitespace-pre-wrap rounded-xl px-3 py-2 text-[clamp(12px,0.9vw,14px)] ${
                        msg.sender === "user" ? "text-white" : "text-[#c8d4ee]"
                      }`}
                      style={{
                        background:
                          msg.sender === "user" ? "#2d4a8a" : "#1e2535",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {sendMutation.isPending && (
                  <div className="flex justify-start">
                    <div
                      className="px-3 py-2 rounded-xl text-xs text-[#4a5568]"
                      style={{ background: "#1e2535" }}
                    >
                      <span className="animate-pulse">Thinking…</span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div
                className="px-3 py-2 flex gap-2"
                style={{ borderTop: "1px solid #1e2535" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask the AI assistant…"
                  className="flex-1 bg-[#0d1117] text-white text-[clamp(12px,0.9vw,14px)] rounded-lg px-3 py-2 outline-none"
                  style={{ border: "1px solid #1e2535" }}
                />

                <button
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                  className="px-3 py-2 rounded-lg text-xs text-white"
                  style={{
                    background:
                      isAlertCtx || alertContext
                        ? "linear-gradient(135deg, #c0392b, #e74c3c)"
                        : "linear-gradient(135deg, #2563eb, #4f8ef7)",
                  }}
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
