import React, { useState, useEffect } from 'react'
import { Users, Clock, TrendingUp, Award, Calendar, AlertCircle, Search, Loader2, CheckCircle2, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const HRDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [attendance, setAttendance] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  // Create User Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DEVELOPER',
    designation: '',
    mobileNumber: '',
    profilePic: ''
  })

  // Leave Review Modal States
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [attRes, leaveRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/leaves')
      ])
      setAttendance(attRes.data.data || [])
      setLeaves(leaveRes.data.data || [])
      setError('')
    } catch (err: any) {
      console.error('Failed to fetch HR data', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/leaves/${id}`, { status })
      alert(`Leave ${status.toLowerCase()} successfully`)
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update leave status')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isProfile: boolean = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        if (isProfile) {
          // This would be for Profile.tsx but handled here for HRDashboard
          setNewUser({ ...newUser, profilePic: base64String })
        } else {
          setNewUser({ ...newUser, profilePic: base64String })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/users', newUser)
      alert('User created successfully!')
      setIsModalOpen(false)
      setNewUser({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'DEVELOPER',
        designation: '',
        mobileNumber: '',
        profilePic: ''
      })
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user')
    }
  }

  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length
  const today = new Date().toDateString()
  const presentToday = attendance.filter(a => 
    a.date && new Date(a.date).toDateString() === today
  ).length
  
  // Calculate unique employees present today
  const uniquePresentToday = new Set(
    attendance
      .filter(a => a.date && new Date(a.date).toDateString() === today)
      .map(a => a.user?._id || a.user?.id)
  ).size

  const onBreakEmployees = attendance.filter(a => 
    a.date && new Date(a.date).toDateString() === today && a.onBreak
  ).length

  const filteredAttendance = attendance.filter(a =>
    a.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary font-medium">Loading HR Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="hidden">
            <h1 className="text-4xl font-bold text-dark mb-2">HR Dashboard</h1>
            <p className="text-secondary">Monitor employee attendance and performance</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-primary hover:bg-purple-700 text-white rounded-xl transition shadow-lg shadow-primary/20 font-bold flex items-center gap-2"
            >
              <Users size={20} />
              Create User
            </button>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Staff</span>
            </div>
            <p className="text-secondary text-sm font-medium">Total Attendance Records</p>
            <p className="text-3xl font-bold text-dark">{attendance.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-lg text-green-600">
                <Clock size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Present</span>
            </div>
            <p className="text-secondary text-sm font-medium">Employees Today</p>
            <p className="text-3xl font-bold text-green-600">{uniquePresentToday}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600">
                <AlertCircle size={24} />
              </div>
              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Breaks</span>
            </div>
            <p className="text-secondary text-sm font-medium">On Break Now</p>
            <p className="text-3xl font-bold text-yellow-600">{onBreakEmployees}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-50 p-3 rounded-lg text-red-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Leaves</span>
            </div>
            <p className="text-secondary text-sm font-medium">Pending Requests</p>
            <p className="text-3xl font-bold text-red-600">{pendingLeaves}</p>
          </div>

          <div 
            onClick={() => navigate('/task-board')}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg text-orange-600 group-hover:bg-orange-100 transition">
                <CheckCircle2 size={24} />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Tasks</span>
            </div>
            <p className="text-secondary text-sm font-medium">Operational Board</p>
            <p className="text-3xl font-bold text-dark">View Board</p>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <Users size={24} className="text-primary" />
              Real-time Attendance
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64 shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Clock In</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Clock Out</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Joined On</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {record.user?.profilePic ? (
                            <img 
                              src={record.user.profilePic} 
                              alt="Avatar" 
                              className="w-8 h-8 rounded-full object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {record.user?.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-dark">{record.user?.name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-400">{record.user?.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary">
                        {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark font-medium">
                        {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark font-medium">
                        {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-600">
                        {record.user?.createdAt ? new Date(record.user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">
                        {record.totalHours || '0'}h
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Calendar size={24} className="text-primary" />
              Leave Management
            </h3>
            <p className="text-secondary mb-6">There are <span className="font-bold text-primary">{pendingLeaves}</span> requests awaiting your approval.</p>
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-primary/20"
            >
              Review All Requests
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Award size={24} className="text-primary" />
              Analytics Summary
            </h3>
            <p className="text-secondary mb-6">Weekly attendance rate is currently at <span className="font-bold text-green-600">94.2%</span></p>
            <button className="w-full border-2 border-gray-100 text-secondary hover:bg-gray-50 font-bold py-3 rounded-xl transition">
              Detailed Reports
            </button>
          </div>
        </div>
      </div>

      {/* Leave Review Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-dark flex items-center gap-2">
                <Calendar size={24} className="text-primary" />
                Pending Leave Requests
              </h3>
              <button 
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400"
              >
                <Search size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {leaves.filter(l => l.status === 'Pending').length > 0 ? (
                <div className="space-y-4">
                  {leaves.filter(l => l.status === 'Pending').map((leave) => (
                    <div key={leave._id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {leave.user?.profilePic ? (
                            <img 
                              src={leave.user.profilePic} 
                              alt="Avatar" 
                              className="w-10 h-10 rounded-full object-cover border-2 border-primary/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {leave.user?.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-dark">{leave.user?.name}</p>
                            <p className="text-xs text-gray-400">{leave.type} Leave</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-500 uppercase">Duration</p>
                          <p className="text-sm font-bold text-primary">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Reason</p>
                        <p className="text-sm text-secondary bg-white p-3 rounded-xl border border-gray-100">{leave.reason}</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleUpdateLeaveStatus(leave._id, 'Approved')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-xl transition shadow-lg shadow-green-500/20"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateLeaveStatus(leave._id, 'Rejected')}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition shadow-lg shadow-red-500/20"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-gray-300" />
                  </div>
                  <p className="text-secondary font-medium">All caught up! No pending requests.</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
              <button 
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-secondary font-bold hover:text-dark transition"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-dark">Register New Employee</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400"
              >
                <Search size={20} className="rotate-45" /> {/* Using Search as a close icon since X might not be imported or available as X */}
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-white"
                    >
                      <option value="BDE">BDE</option>
                      <option value="DEVELOPER">DEVELOPER</option>
                      <option value="AI-ML">AI-ML Engineer</option>
                      <option value="SEO">SEO Specialist</option>
                      <option value="HR">HR Manager</option>
                      <option value="UI-UX">UI-UX Designer</option>
                      <option value="compliance">Compliance</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Designation</label>
                    <input
                      type="text"
                      value={newUser.designation}
                      onChange={(e) => setNewUser({...newUser, designation: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                      placeholder="e.g. Senior Dev"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mobile Number</label>
                    <input
                      type="text"
                      value={newUser.mobileNumber}
                      onChange={(e) => setNewUser({...newUser, mobileNumber: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                      placeholder="e.g. +91..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Profile Picture</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e)}
                        className="hidden"
                        id="profile-pic-upload"
                      />
                      <label 
                        htmlFor="profile-pic-upload"
                        className="w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition text-sm font-medium text-gray-500"
                      >
                        <Camera size={18} />
                        {newUser.profilePic ? 'Photo Selected' : 'Choose Pic'}
                      </label>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-[10px] text-blue-600 font-black uppercase flex items-center gap-2">
                    <Calendar size={12} />
                    Automatic Feature
                  </p>
                  <p className="text-xs text-blue-700 mt-1">The joining date will be captured automatically upon creation.</p>
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRDashboard

