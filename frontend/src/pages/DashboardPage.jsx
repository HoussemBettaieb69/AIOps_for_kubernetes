import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const cpuData = [
  { time: "10:00", value: 30 },
  { time: "10:05", value: 45 },
  { time: "10:10", value: 60 },
  { time: "10:15", value: 55 },
  { time: "10:20", value: 70 },
  { time: "10:25", value: 50 },
];

const memoryData = [
  { time: "10:00", value: 40 },
  { time: "10:05", value: 50 },
  { time: "10:10", value: 65 },
  { time: "10:15", value: 75 },
  { time: "10:20", value: 80 },
  { time: "10:25", value: 85 },
];

const podsTableData = [
  {
    id: 1,
    name: "payment-api-6f8d7",
    cpu: "72%",
    memory: "81%",
    status: "Warning",
  },
  {
    id: 2,
    name: "auth-service-2x9k1",
    cpu: "55%",
    memory: "63%",
    status: "Running",
  },
  {
    id: 3,
    name: "nginx-xyz-78asd",
    cpu: "35%",
    memory: "40%",
    status: "Running",
  },
  { id: 4, name: "orders-db-0", cpu: "0%", memory: "0%", status: "Down" },
];

export default function DashboardPage() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {[
          { title: "CPU Usage", value: "65%", color: "text-blue-400" },
          { title: "Memory Usage", value: "78%", color: "text-yellow-400" },
          { title: "Active Pods", value: "24", color: "text-green-400" },
          { title: "Incidents", value: "3", color: "text-red-400" },
        ].map((item) => (
          <div
            key={item.title}
            className="col-span-12 sm:col-span-6 lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          >
            <p className="text-sm text-neutral-400">{item.title}</p>
            <h2 className={`text-2xl font-bold mt-2 ${item.color}`}>
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* CPU Chart */}
        <div className="col-span-12 lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">CPU Usage</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Chart */}
        <div className="col-span-12 lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Memory Usage</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#eab308"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
          ✨ AI Summary
        </h2>

        <p className="text-neutral-300 leading-relaxed bg-blue-500/5 p-4 rounded-lg border border-blue-500/10">
          Cluster is operating within normal parameters. Memory usage is
          trending upward on the{" "}
          <span className="text-blue-400 font-mono">payment-api</span> service —
          monitor over the next 30 minutes. One CPU spike was detected at 14:32
          on pod <span className="text-blue-400 font-mono">nginx-xyz</span> but
          has since stabilized.
        </p>
      </div>
      {/* Pods Table */}
      <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold">Pods Status</h2>
        </div>

        <table className="w-full text-left">
          <thead className="bg-neutral-800/50">
            <tr className="border-b border-neutral-800">
              <th className="px-6 py-4 text-sm font-semibold">Pod Name</th>
              <th className="px-6 py-4 text-sm font-semibold">CPU</th>
              <th className="px-6 py-4 text-sm font-semibold">Memory</th>
              <th className="px-6 py-4 text-sm font-semibold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-800">
            {podsTableData.map((pod) => (
              <tr
                key={pod.id}
                className="hover:bg-neutral-800/30 transition-colors"
              >
                <td className="px-6 py-4 text-blue-400 font-mono">
                  {pod.name}
                </td>

                <td className="px-6 py-4 text-neutral-300">{pod.cpu}</td>

                <td className="px-6 py-4 text-neutral-300">{pod.memory}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      pod.status === "Running"
                        ? "bg-green-500/20 text-green-400"
                        : pod.status === "Warning"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {pod.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
