import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const severityData = [
  { name: 'High', value: 3, color: '#ef4444' },
  { name: 'Medium', value: 5, color: '#eab308' },
  { name: 'Low', value: 2, color: '#3b82f6' },
];

const alertsTableData = [
  { id: 1, title: 'Pod CrashLoopBackOff — payment-api', type: 'Incident', typeColor: 'bg-red-500/20 text-red-400', severity: 'High', severityColor: 'bg-red-500/20 text-red-400', status: 'Open' },
  { id: 2, title: 'Memory spike predicted — auth-service', type: 'Prediction', typeColor: 'bg-yellow-500/20 text-yellow-400', severity: 'Medium', severityColor: 'bg-yellow-500/20 text-yellow-400', status: 'Open' },
  { id: 3, title: 'High CPU usage — nginx-xyz', type: 'Incident', typeColor: 'bg-blue-500/20 text-blue-400', severity: 'Low', severityColor: 'bg-blue-500/20 text-blue-400', status: 'Resolved' },
];

export default function AlertsPage() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Alerts</h1>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* By Severity Card */}
        <div className="col-span-12 lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">By severity</h2>
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-400">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary Card */}
        <div className="col-span-12 lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
            <span>✨</span> AI Summary
          </h2>
          <p className="text-neutral-300 leading-relaxed bg-blue-500/5 p-4 rounded-lg border border-blue-500/10">
            3 high severity incidents detected in the last hour, all linked to the <span className="text-blue-400 font-mono">payment-api</span> service. 
            Memory exhaustion is the likely root cause. Predictions indicate further degradation within the next 20 minutes if no action is taken.
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-neutral-800/50">
            <tr className="border-b border-neutral-800">
              <th className="px-6 py-4 text-sm font-semibold">Title</th>
              <th className="px-6 py-4 text-sm font-semibold">Type</th>
              <th className="px-6 py-4 text-sm font-semibold">Severity</th>
              <th className="px-6 py-4 text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {alertsTableData.map((alert) => (
              <tr key={alert.id} className="hover:bg-neutral-800/30 transition-colors">
                <td className="px-6 py-4 text-blue-400 hover:underline cursor-pointer">{alert.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${alert.typeColor}`}>
                    {alert.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${alert.severityColor}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-400">{alert.status}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-500 hover:text-red-400 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}