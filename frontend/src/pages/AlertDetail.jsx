import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useChatContext } from './ChatContext.jsx';

const API = 'http://localhost:8000';

export default function AlertDetailPage({ type }) {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState('All');
  const { setAlertContext } = useChatContext();

  useEffect(() => {
    fetch(`${API}/${type}s/${id}`)
      .then(res => res.json())
      .then(data => {
        setAlert(data);
        if (data) {
          setAlertContext({ alertId: data.id || id, title: data.title || 'Untitled Alert' });
        }
      })
      .catch(err => console.error("Fetch error:", err));

    return () => setAlertContext(null);
  }, [id, type, setAlertContext]);

  if (!alert) return (
    <div className="p-8 text-white flex items-center gap-3">
      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      Loading alert details...
    </div>
  );

  // Helper to safely format timestamp strings without crashing on non-string types
  const formatTime = (ts) => {
    const tsStr = String(ts || '');
    return tsStr.includes('T') 
      ? tsStr.split('T')[1].substring(0, 8) 
      : (tsStr || '00:00:00');
  };

  const combined = [
    ...(alert.logs?.map(l => ({
      id: `${l.timestamp || Math.random()}-log`,
      type: 'Log',
      typeColor: l.level === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400',
      timestamp: formatTime(l.timestamp),
      rawTimestamp: l.timestamp, // Kept for accurate sorting
      content: l.message || 'No message provided'
    })) || []),
    ...(alert.metrics?.map(m => ({
      id: `${m.timestamp || Math.random()}-metric`,
      type: 'Metric',
      typeColor: 'bg-blue-500/20 text-blue-400',
      timestamp: formatTime(m.timestamp),
      rawTimestamp: m.timestamp, // Kept for accurate sorting
      content: `CPU: ${m.cpu || 0}% · RAM: ${m.memory || 0}%`
    })) || [])
  ].sort((a, b) => {
    // Robust sorting: Handles strings or numbers by converting to Date objects
    const dateA = new Date(a.rawTimestamp || 0);
    const dateB = new Date(b.rawTimestamp || 0);
    return dateB - dateA; // Newest first
  });

  const filteredData = filter === 'All' ? combined : combined.filter(d => d.type === filter);

  const severityColor = alert.severity === 'high'
    ? 'bg-red-900/30 text-red-400 border-red-500/20'
    : alert.severity === 'medium'
    ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/20'
    : 'bg-blue-900/30 text-blue-400 border-blue-500/20';

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <Link to="/alerts" className="inline-flex mb-6 px-4 py-2 bg-neutral-900 border border-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors ">
          <span>←</span> Back to Alerts
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-3">{alert.title || 'Unknown Alert'}</h1>
            <div className="flex gap-3">
              <span className={`px-2 py-1 text-xs font-bold rounded border ${severityColor}`}>
                {alert.severity || 'low'}
              </span>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs font-bold rounded border border-blue-500/20">
                {type}
              </span>
              {type === 'prediction' && (
                <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs font-bold rounded border border-purple-500/20">
                  Confidence: {alert.confidence || 0}%
                </span>
              )}
            </div>
          </div>
          <p className="text-neutral-500 text-sm font-mono">
            {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'No timestamp'}
          </p>
        </div>
      </div>

      {/* AI Suggestion Boxes */}
      <div className="grid gap-6 mb-10">
        <div className="bg-neutral-900 border-l-4 border-yellow-500 p-6 rounded-r-lg">
          <h2 className="text-yellow-500 font-bold mb-2 flex items-center gap-2">
            <span>💡</span> AI Suggestion
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">{alert.suggestion || 'Analyzing diagnostic data...'}</p>
        </div>

        <div className="bg-neutral-900 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <h2 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
            <span>✨</span> AI Analysis Summary
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">{alert.summary || 'No summary available.'}</p>
        </div>
      </div>

      {/* Diagnostic Evidence Table */}
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
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.typeColor}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-neutral-400">{item.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-neutral-300">{item.content}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-neutral-500 text-sm italic">
                    No diagnostic data found for this alert.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}