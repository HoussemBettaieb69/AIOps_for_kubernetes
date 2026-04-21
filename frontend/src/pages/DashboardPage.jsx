import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import AIChat from '../components/AIChat.jsx';
const API_BASE_URL = 'http://localhost:8000';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ cpu_history: [], mem_history: [], pods: [] });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to turn Prometheus UNIX strings into HH:mm:ss
  const formatTime = (unixStr) => {
    const date = new Date(parseInt(unixStr) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchData = async () => {
    try {
      const [metricRes, incidentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/metrics/`),
        fetch(`${API_BASE_URL}/incidents/`)
      ]);

      const metricData = await metricRes.json();
      const incidentData = await incidentRes.json();

      setMetrics(metricData);
      setIncidents(incidentData);
    } catch (error) {
      console.error("Data Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-white animate-pulse">Connecting to Cluster...</div>;

  const activeIncidents = incidents.filter(i => i.status === 'open').length;
  
  // Get latest CPU from the last entry in the history list
  const latestCpu = metrics.cpu_history.length > 0 
    ? `${metrics.cpu_history[metrics.cpu_history.length - 1].value}%` 
    : "0%";

  return (
    <div className="p-8 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-8">System Dashboard</h1>

      {/* 1. Top Stats Row */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {[
          { title: "Current CPU", value: latestCpu, color: "text-blue-400" },
          { title: "Nodes Online", value: "3", color: "text-green-400" },
          { title: "Active Pods", value: metrics.pods.length, color: "text-purple-400" },
          { title: "Active Incidents", value: activeIncidents, color: "text-red-400" },
        ].map((item) => (
          <div key={item.title} className="col-span-12 sm:col-span-6 lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-neutral-400 uppercase tracking-wider">{item.title}</p>
            <h2 className={`text-3xl font-bold mt-2 ${item.color}`}>{item.value}</h2>
          </div>
        ))}
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-neutral-200">CPU Load (Prometheus Stream)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={metrics.cpu_history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#525252" 
                  fontSize={10} 
                  tickFormatter={formatTime} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                   shared={true}
                   trigger="mousemove"
                   labelFormatter={formatTime}
                   contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040' }} 
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-neutral-200">Memory Allocation (%)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={metrics.mem_history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#525252" 
                  fontSize={10} 
                  tickFormatter={formatTime} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={formatTime}
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040' }} 
                />
                <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Pod Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-800/20">
          <h2 className="text-lg font-semibold">Pod Resource Management</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-neutral-900 text-neutral-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Pod Identifier</th>
              <th className="px-6 py-4 font-semibold text-center">CPU Usage</th>
              <th className="px-6 py-4 font-semibold text-center">Memory</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {metrics.pods.map((pod, idx) => (
              <tr key={idx} className="hover:bg-neutral-800/40 transition-colors">
                <td className="px-6 py-4 text-blue-400 font-mono">
                  {pod.pod_name}
                </td>
                <td className="px-6 py-4 text-center text-neutral-300 font-mono">
                  {pod.cpu}%
                </td>
                <td className="px-6 py-4 text-center text-neutral-300 font-mono">
                  {pod.memory}%
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    pod.status === "Running" ? "bg-green-500/10 text-green-400 border border-green-500/20" : 
                    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}>
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