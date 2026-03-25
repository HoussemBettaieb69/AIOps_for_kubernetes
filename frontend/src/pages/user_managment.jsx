import { useState } from 'react'
import { Link } from 'react-router-dom';
export default function UserManagementPage() {
  const [users, setUsers] = useState([
    { id: '1', username: 'admin', password: '••••••••', isAdmin: true },
    { id: '2', username: 'operator_1', password: '••••••••', isAdmin: false },
    { id: '3', username: 'operator_2', password: '••••••••', isAdmin: false },
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const handleDelete = (userId) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterRole === 'all' ||
        (filterRole === 'admin' && user.isAdmin) ||
        (filterRole === 'operator' && !user.isAdmin))
  )

  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <Link to="/login">
          <button className="mb-6 px-4 py-2 bg-neutral-900 border border-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors">
             ← Back to Sign In
          </button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">User Management</h1>

          {/* Controls: Search and Add */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse">
              + Add user
            </button>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 md:w-80"
            />
            
            {/* Simple Filter Dropdown */}
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins Only</option>
              <option value="operator">Operators Only</option>
            </select>
          </div>
        </div>

        {/* The Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-800/50">
              <tr>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800">Username</th>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800">Password</th>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800 text-center">Admin Status</th>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800 text-center">change status</th>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="p-4 text-white font-medium">{user.username}</td>
                  <td className="p-4 text-neutral-500 font-mono text-sm">{user.password}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isAdmin ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-neutral-800 text-neutral-500'}`}>
                      {user.isAdmin ? 'ADMIN' : 'OPERATOR'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={user.isAdmin}>
                    </input>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">Edit</button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(100,50,50,0.75)]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-neutral-600 italic">
          Security Note: Passwords are encrypted in the production database.
        </p>
      </div>
    </div>
  )
}