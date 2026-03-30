export default function AIButton({ mode = "general", onClick }) {
  const isAlertMode = mode === "alert";

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
        isAlertMode
          ? "bg-red-500 text-white"
          : "bg-blue-500 text-white"
      }`}
    >
      AI
    </button>
  );
}