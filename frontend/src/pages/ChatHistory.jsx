export default function ChatHistoryPage() {
  const history = [
    {
      id: 1,
      title: "Incident #42",
      subtitle: "Why did the pod crash?",
      active: true,
    },
    {
      id: 2,
      title: "General chat",
      subtitle: "Cluster status summary",
      active: false,
    },
  ];

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">AI Assistant</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-sm text-neutral-400 mb-4">
            Conversation history
          </h2>

          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg cursor-pointer ${
                  item.active
                    ? "bg-blue-500/20 text-blue-300"
                    : "hover:bg-neutral-800"
                }`}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-neutral-400">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-12 lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col">
          {/* Top bar */}
          <div className="flex justify-between items-center p-4 border-b border-neutral-800">
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
              Incident #42 context
            </span>

            <button className="text-sm text-neutral-400 hover:text-white">
              Hide
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 space-y-4">
            <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg ml-auto max-w-[70%]">
              Why did the pod crash?
            </div>

            <div className="bg-neutral-800 text-neutral-200 px-4 py-3 rounded-lg max-w-[80%]">
              The pod was terminated due to an OOMKilled signal — it exceeded
              its memory limit of 512MB. This was triggered by an unbounded
              database query.
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-neutral-800 flex gap-2">
            <input
              placeholder="Ask about this incident..."
              className="flex-1 bg-neutral-800 px-3 py-2 rounded text-sm outline-none"
            />

            <button className="bg-blue-500 px-4 rounded text-sm hover:bg-blue-400">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}