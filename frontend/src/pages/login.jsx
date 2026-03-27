import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const handleSignIn = async (e) => {
  e.preventDefault()
  setError('')
  try {
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (!res.ok) {
      setError('Invalid username or password')
      return
    }
    const user = await res.json()
    localStorage.setItem('user', JSON.stringify(user))
    navigate(user.isAdmin ? '/user_management' : '/alerts')
  } catch {
    setError('Cannot connect to server')
  }
}

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      
      {/* el moraba3 lak7el */}
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          
          {/* logo eli YECH3EL */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse">
              <span className="text-2xl font-bold text-white">AI</span>
            </div>
          </div>

          {/* titre */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">AIOps Platform</h1>
            <p className="text-neutral-400 text-sm">Sign in to continue to Kubernetes</p>
          </div>

          {/* mnin yabda el Form  */}
          <form onSubmit={handleSignIn} className="space-y-4">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            {/* Sign In Button  */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all active:scale-[0.98] shadow-lg mt-2"
            >
              Sign in
            </button>
          </form>

          {/* message */}
          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500 hover:text-blue-400 transition-colors">
              Need access? Contact your Cluster Admin
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}