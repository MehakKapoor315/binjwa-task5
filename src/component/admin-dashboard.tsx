import React, { useState, useEffect } from 'react'
import { Settings, Users, BarChart3, Lock, Edit, Trash2, Plus, X, Search, Clock, Calendar, Palmtree, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

interface User {
  _id: string
  name: string
  email: string
  role: string
  status: string
  totalTime: string
  totalDays: number
  leaveDays: number
  createdAt: string
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [currentUser, setCurrentUser] = useState<Partial<User>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users')
      setUsers(response.data.data || [])
      setError('')
    } catch (err) {
      setError('Failed to fetch users. Please check your permissions.')
    } finally {
      setLoading(false)
    }
  }

  const [settings] = useState({
    companyName: 'Your Company',
    workingHours: '9:00 AM - 6:00 PM',
    timezone: 'UTC-5',
    currency: 'USD',
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`)
        setUsers(users.filter(u => u._id !== id))
      } catch (err) {
        alert('Failed to delete user')
      }
    }
  }

  const handleEdit = (user: User) => {
    setModalMode('edit')
    setCurrentUser(user)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setModalMode('add')
    setCurrentUser({
      name: '',
      email: '',
      role: 'employee',
      status: 'Active',
      totalTime: '0h',
      totalDays: 0,
      leaveDays: 0
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (modalMode === 'add') {
        const response = await api.post('/users', currentUser)
        setUsers([...users, response.data.data])
      } else {
        const response = await api.put(`/users/${currentUser._id}`, currentUser)
        setUsers(users.map(u => u._id === currentUser._id ? response.data.data : u))
      }
      setIsModalOpen(false)
    } catch (err) {
      alert('Failed to save user')
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="hidden">
            <h1 className="text-4xl font-bold text-dark mb-2">Admin Dashboard</h1>
            <p className="text-secondary">Comprehensive system management and user oversight</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64 shadow-sm"
              />
            </div>
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition shadow-lg shadow-primary/20 font-semibold"
            >
              <Plus size={20} />
              Add User
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Users</span>
            </div>
            <p className="text-secondary text-[10px] mb-1 font-black uppercase tracking-widest">Total Personnel</p>
            <p className="text-4xl font-black text-dark tracking-tighter">{users.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <Clock className="text-green-600" size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Attendance</span>
            </div>
            <p className="text-secondary text-[10px] mb-1 font-black uppercase tracking-widest">Active Status</p>
            <p className="text-4xl font-black text-green-600 tracking-tighter">{users.filter(u => u.status === 'Active').length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-xl">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Time</span>
            </div>
            <p className="text-secondary text-sm mb-1 font-medium">Avg. Days/Month</p>
            <p className="text-3xl font-bold text-dark">21.5</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-50 p-3 rounded-xl">
                <Palmtree className="text-red-600" size={24} />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Leaves</span>
            </div>
            <p className="text-secondary text-sm mb-1 font-medium">Pending Approvals</p>
            <p className="text-3xl font-bold text-red-600">8</p>
          </div>

          <div 
            onClick={() => navigate('/task-board')}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-orange-100 transition">
                <CheckCircle2 className="text-orange-600" size={24} />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Tasks</span>
            </div>
            <p className="text-secondary text-sm mb-1 font-medium">Operational Board</p>
            <p className="text-3xl font-bold text-dark">View Board</p>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <Users size={24} className="text-primary" />
              Staff Management & Metrics
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Work Days</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joining Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-dark">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-dark capitalize">{user.role}</span>
                        <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Clock size={14} />
                        {user.totalTime || '0h'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-dark">
                        <Calendar size={14} className="text-gray-400" />
                        {user.totalDays || 0} Days
                      </div>
                    </td>
                     <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <Calendar size={14} className="text-primary/60" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Settings & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
              <Settings size={28} className="text-primary" />
              Global Configuration
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Company Name</label>
                  <input
                    type="text"
                    defaultValue={settings.companyName}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Working Hours</label>
                  <input
                    type="text"
                    defaultValue={settings.workingHours}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Timezone</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition appearance-none bg-white">
                    <option value="UTC-5">{settings.timezone}</option>
                    <option value="UTC-6">UTC-6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Currency</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition appearance-none bg-white">
                    <option value="USD">{settings.currency}</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              <button className="w-full bg-dark hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-dark/10">
                Update System Settings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">Audit Logs</h2>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg">Real-time</span>
            </div>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: '10:30 AM', action: 'User John Doe clocked in', type: 'success' },
                { time: '09:15 AM', action: 'Admin updated HR permissions', type: 'info' },
                { time: '08:45 AM', action: 'Mike Johnson requested leave', type: 'warning' },
                { time: '08:00 AM', action: 'System Backup completed', type: 'success' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition">
                  <div className={`w-1 h-full rounded-full ${
                    log.type === 'success' ? 'bg-green-500' : log.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-0.5">{log.time}</p>
                    <p className="text-sm font-medium text-dark">{log.action}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 border-2 border-gray-100 text-secondary hover:bg-gray-50 font-bold py-3 rounded-xl transition">
              Export Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-dark">
                {modalMode === 'add' ? 'Add New Personnel' : 'Edit Personnel Details'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={currentUser.name || ''}
                    onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="e.g. Robert Fox"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={currentUser.email || ''}
                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="robert@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Password (Required for new users)</label>
                  <input
                    type="password"
                    value={currentUser.password || ''}
                    onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Role</label>
                    <select
                      value={currentUser.role || 'DEVELOPER'}
                      onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="HR">HR Manager</option>
                      <option value="BDE">BDE</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="AI-ML">AI/ML Engineer</option>
                      <option value="SEO">SEO Specialist</option>
                      <option value="UI-UX">UI/UX Designer</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Status</label>
                    <select
                      value={currentUser.status || 'Active'}
                      onChange={(e) => setCurrentUser({...currentUser, status: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-5 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Total Time</label>
                    <input
                      type="text"
                      value={currentUser.totalTime || '0h'}
                      onChange={(e) => setCurrentUser({...currentUser, totalTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Work Days</label>
                    <input
                      type="number"
                      value={currentUser.totalDays || 0}
                      onChange={(e) => setCurrentUser({...currentUser, totalDays: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Leaves</label>
                    <input
                      type="number"
                      value={currentUser.leaveDays || 0}
                      onChange={(e) => setCurrentUser({...currentUser, leaveDays: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-secondary font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-primary/20"
                >
                  {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

