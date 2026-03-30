import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:8000';

export default function AlertsPage() {
  const [incidents, setIncidents] = useState([])
  const [predictions, setPredictions] = useState([])
  const [filter, setFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [incRes, predRes] = await Promise.all([
      fetch(`${API}/incidents/`),
      fetch(`${API}/predictions/`)
    ])
    const incData = await incRes.json()
    const predData = await predRes.json()
    setIncidents(incData)
    setPredictions(predData)
  }

  const handleDelete = async (id, type) => {
    await fetch(`${API}/${type}s/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const handleStatusChange = async (id, type, newStatus) => {
    await fetch(`${API}/${type}s/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    fetchData()
  }

  const allAlerts = [
    ...incidents.map(i => ({ ...i, type: 'incident' })),
    ...predictions.map(p => ({ ...p, type: 'prediction' }))
  ]

  const filtered = allAlerts.filter(a => {
    const typeMatch = filter === 'all' || a.type === filter
    const severityMatch = severityFilter === 'all' || a.severity === severityFilter
    return typeMatch && severityMatch
  })

  const severityCounts = {
    high: allAlerts.filter(a => a.severity === 'high').length,
    medium: allAlerts.filter(a => a.severity === 'medium').length,
    low: allAlerts.filter(a => a.severity === 'low').length,
  }

  const pieData = [
    { name: 'High', value: severityCounts.high, color: '#ef4444' },
    { name: 'Medium', value: severityCounts.medium, color: '#eab308' },
    { name: 'Low', value: severityCounts.low, color: '#3b82f6' },
  ]

  const severityColor = (s) => {
    if (s === 'high') return 'bg-red-500/20 text-red-400'
    if (s === 'medium') return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-blue-500/20 text-blue-400'
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Alerts</h1>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Pie chart */}
        <div className="col-span-12 lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">By severity</h2>
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.map((item) => (
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

        {/* AI Summary */}
        <div className="col-span-12 lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
            <span>✨</span> AI Summary
          </h2>
          <p className="text-neutral-300 leading-relaxed bg-blue-500/5 p-4 rounded-lg border border-blue-500/10">
            {severityCounts.high} high severity incidents detected in the last hour.
            Memory exhaustion is the likely root cause on the{' '}
            <span className="text-blue-400 font-mono">payment-api</span> service.
            {predictions.length > 0 && ` ${predictions.length} predictions indicate further degradation if no action is taken.`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">All</option>
          <option value="incident">Incidents</option>
          <option value="prediction">Predictions</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">All severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Table */}
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
            {filtered.map((alert) => (
              <tr key={`${alert.type}-${alert.id}`} className="hover:bg-neutral-800/30 transition-colors">
                <td
                  className="px-6 py-4 text-blue-400 hover:underline cursor-pointer"
                  onClick={() => navigate(`/${alert.type}s/${alert.id}`)}
                >
                  {alert.title}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${alert.type === 'incident' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {alert.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${severityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={alert.status}
                    onChange={(e) => handleStatusChange(alert.id, alert.type, e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 text-white text-sm px-2 py-1 rounded outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(alert.id, alert.type)}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}