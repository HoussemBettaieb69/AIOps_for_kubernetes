import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:8000/auth'

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch(`${API}/users`)
    const data = await res.json()
    setUsers(data)
  }

  const handleToggleAdmin = async (user) => {
    await fetch(`${API}/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: !user.isAdmin })
    })
    fetchUsers()
  }

  const handleDelete = async (userId) => {
    await fetch(`${API}/users/${userId}`, { method: 'DELETE' })
    fetchUsers()
  }

  const handleAddUser = async () => {
    setError('')
    if (!newUser.username || !newUser.password) {
      setError('Username and password are required')
      return
    }
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    if (!res.ok) {
      const err = await res.json()
      setError(err.detail)
      return
    }
    setNewUser({ username: '', password: '', isAdmin: false })
    setShowAddModal(false)
    fetchUsers()
  }

  const handleEditUser = async () => {
    setError('')
    if (!editingUser.username) {
      setError('Username cannot be empty')
      return
    }
    await fetch(`${API}/users/${editingUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: editingUser.username,
        ...(editingUser.newPassword ? { password: editingUser.newPassword } : {})
      })
    })
    setEditingUser(null)
    fetchUsers()
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

        <div className="mb-8">
          <Link to="/login">
            <button className="mb-6 px-4 py-2 bg-neutral-900 border border-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors">
              ← Back to Sign In
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">User Management</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <button
              onClick={() => { setShowAddModal(true); setError('') }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              + Add user
            </button>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 md:w-80"
            />
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

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-800/50">
              <tr>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800">Username</th>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800">Password</th>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800 text-center">Admin Status</th>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800 text-center">Toggle Admin</th>
                <th className="p-4 text-neutral-300 font-semibold border-b border-neutral-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-4 text-white font-medium">{user.username}</td>
                  <td className="p-4 text-neutral-500 font-mono text-sm">••••••••</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isAdmin ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-neutral-800 text-neutral-500'}`}>
                      {user.isAdmin ? 'ADMIN' : 'OPERATOR'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      onChange={() => handleToggleAdmin(user)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => { setEditingUser({ ...user, newPassword: '' }); setError('') }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
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

      {/* Add user modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">Add new user</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-600"
              />
              <label className="flex items-center gap-3 text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="w-4 h-4"
                />
                Make admin
              </label>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddUser} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">
                Add
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">Edit user</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={editingUser.username}
                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="password"
                placeholder="New password (leave empty to keep current)"
                value={editingUser.newPassword}
                onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-600"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEditUser} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">
                Save
              </button>
              <button onClick={() => setEditingUser(null)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}