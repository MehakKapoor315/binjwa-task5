import React, { useState } from 'react'
import { Mail, Lock, LogIn, ShieldCheck, ArrowRight, UserCircle } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

interface LoginProps {
  onLogin: (role: string) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>('DEVELOPER')
  const [otp, setOtp] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password, role })
      if (response.data.requires2FA) {
        setShow2FA(true)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp) {
      setError('Please enter the security code')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/verify-2fa', { email, otp })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      onLogin(user.role)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] relative flex items-center justify-center p-4 overflow-hidden font-outfit">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500">
          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-6 transform hover:rotate-6 transition-transform">
                {show2FA ? <ShieldCheck className="text-white" size={32} /> : <UserCircle className="text-white" size={32} />}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {show2FA ? 'Security Check' : 'Welcome Back'}
              </h1>
              <p className="text-slate-400">
                {show2FA ? 'Enter the code sent to your device' : 'Manage your CRM operations effortlessly'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            {!show2FA ? (
              <form onSubmit={handleInitialLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Work Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-slate-600"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Access Tier</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="DEVELOPER">Developer Portal</option>
                    <option value="HR">HR Management</option>
                    <option value="admin">System Administrator</option>
                    <option value="BDE">Business Development</option>
                    <option value="AI-ML">AI Engineering</option>
                    <option value="SEO">SEO Analytics</option>
                    <option value="UI-UX">Design Lab</option>
                    <option value="compliance">Compliance Unit</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Secure Login</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-8 animate-fadeIn">
                <div className="space-y-4">
                  <div className="flex justify-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white text-center text-3xl font-mono py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 tracking-[0.5em]"
                      placeholder="000000"
                    />
                  </div>
                  <p className="text-center text-slate-500 text-sm">
                    Enter the 6-digit code provided to you.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      <span>Verify Account</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShow2FA(false)}
                  className="w-full text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Back to credentials
                </button>
              </form>
            )}

            <div className="mt-10 text-center">
              <p className="text-slate-500">
                New member?{' '}
                <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                  Create Platform Access
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-600 text-xs tracking-widest uppercase">
          Enterprise Security Enabled • 256-bit Encryption
        </p>
      </div>
    </div>
  )
}

export default Login