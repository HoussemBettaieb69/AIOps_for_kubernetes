import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API = 'http://localhost:8000';

export default function AlertDetailPage({ type }) {
  const { id } = useParams()
  const [alert, setAlert] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetch(`${API}/${type}s/${id}`)
      .then(res => res.json())
      .then(data => setAlert(data))
  }, [id, type])

  if (!alert) return <div className="p-8 text-white">Loading...</div>

  const combined = [
    ...alert.logs.map(l => ({
      id: l.timestamp + 'log',
      type: 'Log',
      typeColor: l.level === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400',
      timestamp: l.timestamp.split('T')[1].substring(0, 8),
      content: l.message
    })),
    ...alert.metrics.map(m => ({
      id: m.timestamp + 'metric',
      type: 'Metric',
      typeColor: 'bg-blue-500/20 text-blue-400',
      timestamp: m.timestamp.split('T')[1].substring(0, 8),
      content: `cpu_usage = ${m.cpu}% · memory_usage = ${m.memory}%`
    }))
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  const filteredData = filter === 'All' ? combined : combined.filter(d => d.type === filter)

  const severityColor = alert.severity === 'high'
    ? 'bg-red-900/30 text-red-400 border-red-500/20'
    : alert.severity === 'medium'
    ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/20'
    : 'bg-blue-900/30 text-blue-400 border-blue-500/20'

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <Link to="/alerts" className="inline-flex mb-6 px-4 py-2 bg-neutral-900 border border-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors ">
          <span>←</span> Back to Alerts
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-3">{alert.title}</h1>
            <div className="flex gap-3">
              <span className={`px-2 py-1 text-xs font-bold rounded border ${severityColor}`}>
                {alert.severity}
              </span>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs font-bold rounded border border-blue-500/20">
                {type}
              </span>
              {type === 'prediction' && (
                <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs font-bold rounded border border-purple-500/20">
                  Confidence: {alert.confidence}%
                </span>
              )}
            </div>
          </div>
          <p className="text-neutral-500 text-sm font-mono">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="grid gap-6 mb-10">
        <div className="bg-neutral-900 border-l-4 border-yellow-500 p-6 rounded-r-lg">
          <h2 className="text-yellow-500 font-bold mb-2 flex items-center gap-2">
            <span>💡</span> AI Suggestion
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">{alert.suggestion}</p>
        </div>

        <div className="bg-neutral-900 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <h2 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
            <span>✨</span> AI Analysis Summary
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">{alert.summary}</p>
        </div>
      </div>

      {/* Related data */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Diagnostic Evidence</h2>
          <select
            className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded px-3 py-1 cursor-pointer outline-none"
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Log</option>
            <option>Metric</option>
          </select>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-neutral-800/50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold uppercase text-neutral-500">Type</th>
                <th className="px-6 py-3 text-xs font-bold uppercase text-neutral-500">Timestamp</th>
                <th className="px-6 py-3 text-xs font-bold uppercase text-neutral-500">Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredData.map((data) => (
                <tr key={data.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${data.typeColor}`}>
                      {data.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-neutral-400">{data.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-neutral-300">{data.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}