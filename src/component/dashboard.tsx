import React, { useState, useEffect } from 'react'
import { Clock, LogOut, Coffee, Play, Pause, Calendar, Send, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

interface DashboardProps {
  userRole: 'employee' | 'hr' | 'admin' | null
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [isClocked, setIsClocked] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [clockTime, setClockTime] = useState('00:00:00')
  const [clockInTime, setClockInTime] = useState<string | null>(null)
  const [breakTime, setBreakTime] = useState(0)
  const [workingHours, setWorkingHours] = useState('0h 0m')
  const [breakCategory, setBreakCategory] = useState<'tea break' | 'lunch break' | 'other'>('tea break')
  const [activeBreakStart, setActiveBreakStart] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isClocked && !isPaused) {
      interval = setInterval(() => {
        setClockTime(prev => {
          const [h, m, s] = prev.split(':').map(Number)
          let hours = h
          let minutes = m
          let seconds = s + 1

          if (seconds === 60) {
            seconds = 0
            minutes += 1
          }
          if (minutes === 60) {
            minutes = 0
            hours += 1
          }

          const newTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          setWorkingHours(`${hours}h ${minutes}m`)
          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isClocked, isPaused])

  const [leaves, setLeaves] = useState<any[]>([])
  const [leaveData, setLeaveData] = useState({ type: 'Sick', startDate: '', endDate: '', reason: '' })

  useEffect(() => {
    checkCurrentStatus()
    fetchLeaves()
  }, [])

  const checkCurrentStatus = async () => {
    try {
      const response = await api.get('/attendance/me')
      if (response.data.data.length > 0) {
        const lastRecord = response.data.data[0]
        const today = new Date().toDateString()
        const recordDate = new Date(lastRecord.date).toDateString()

        if (today === recordDate && !lastRecord.clockOut) {
          setIsClocked(true)
          setClockInTime(new Date(lastRecord.clockIn).toLocaleTimeString())
          // Calculate initial clockTime
          const diff = Date.now() - new Date(lastRecord.clockIn).getTime()
          const h = Math.floor(diff / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          const s = Math.floor((diff % 60000) / 1000)
          setClockTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
        }
      }
    } catch (err) {
      console.error('Status check failed')
    }
  }

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leaves/me')
      setLeaves(response.data.data)
    } catch (err) {
      console.error('Failed to fetch leaves')
    }
  }

  const handleClockIn = async () => {
    try {
      const response = await api.post('/attendance/clock-in')
      setIsClocked(true)
      setClockInTime(new Date(response.data.data.clockIn).toLocaleTimeString())
      setClockTime('00:00:00')
      setWorkingHours('0h 0m')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Clock-in failed')
    }
  }

  const handleClockOut = async () => {
    try {
      await api.put('/attendance/clock-out')
      setIsClocked(false)
      setClockTime('00:00:00')
      setWorkingHours('0h 0m')
      setClockInTime(null)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Clock-out failed')
    }
  }

  const handleBreakToggle = () => {
    if (!isPaused) {
      // Starting a break
      setIsPaused(true)
      setActiveBreakStart(Date.now())
    } else {
      // Ending a break
      if (activeBreakStart) {
        const durationMs = Date.now() - activeBreakStart
        const durationMin = Math.round(durationMs / 60000)
        setBreakTime(prev => prev + (durationMin > 0 ? durationMin : 1)) // Add at least 1m if it was very short for feedback
      }
      setIsPaused(false)
      setActiveBreakStart(null)
    }
  }

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/leaves', leaveData)
      alert('Leave request submitted')
      setLeaveData({ type: 'Sick', startDate: '', endDate: '', reason: '' })
      fetchLeaves()
    } catch (err) {
      alert('Failed to submit leave')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="hidden text-4xl font-bold text-dark mb-4">Employee Dashboard</h1>
        <p className="hidden text-secondary mb-8">Welcome back! Manage your time and attendance here.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Clock In/Out Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 lg:col-span-2">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
              <Clock className="text-primary" size={28} />
              Time Tracking
            </h2>

            <div className="bg-gray-50 rounded-lg p-8 mb-6">
              <div className="text-center mb-6">
                <p className="text-secondary text-lg mb-2">Current Time</p>
                <p className="text-5xl font-bold text-primary font-mono">{clockTime}</p>
              </div>

              {clockInTime && (
                <div className="text-center mb-6">
                  <p className="text-secondary">Clocked In At: <span className="font-semibold text-dark">{clockInTime}</span></p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!isClocked ? (
                <button
                  onClick={handleClockIn}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <Clock size={20} />
                  Clock In
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBreakToggle}
                    className={`flex-1 font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-white ${
                      isPaused ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                    {isPaused ? 'End Break' : 'Start Break'}
                  </button>
                  <button
                    onClick={handleClockOut}
                    disabled={isPaused}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <LogOut size={20} />
                    Clock Out
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Break Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
              <Coffee className="text-primary" size={28} />
              Break Time
            </h2>

            <div className="bg-gradient-to-br from-primary to-purple-600 text-white rounded-lg p-6 mb-6">
              <p className="text-sm opacity-90 mb-2">Total Break Time</p>
              <p className="text-4xl font-bold">{breakTime}m</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Break Category</label>
                <select
                  value={breakCategory}
                  onChange={(e) => setBreakCategory(e.target.value as any)}
                  disabled={isPaused || !isClocked}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-50"
                >
                  <option value="tea break">Tea Break</option>
                  <option value="lunch break">Lunch Break</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={handleBreakToggle}
                disabled={!isClocked}
                className={`w-full font-bold py-3 rounded-lg transition duration-200 text-white ${
                  isPaused 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-primary hover:bg-purple-700'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {isPaused ? 'End Break' : `Start ${breakCategory.charAt(0).toUpperCase() + breakCategory.slice(1)}`}
              </button>

              {isPaused && (
                <div className="text-center">
                  <p className="text-sm text-yellow-600 animate-pulse font-medium"> Currently on {breakCategory}... </p>
                </div>
              )}
            </div>
          </div>

          {/* Working Hours Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={28} />
              Tasks
            </h2>
            <div 
              onClick={() => navigate('/task-board')}
              className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <p className="text-sm opacity-90 mb-2">Assigned Mission</p>
              <p className="text-3xl font-bold">View Board</p>
            </div>
          </div>

          {/* Leave Request Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 lg:col-span-2">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
              <Calendar className="text-primary" size={28} />
              Apply for Leave
            </h2>
            <form onSubmit={handleLeaveSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={leaveData.type}
                  onChange={e => setLeaveData({...leaveData, type: e.target.value})}
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full border rounded-lg p-2" 
                    value={leaveData.startDate}
                    onChange={e => setLeaveData({...leaveData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full border rounded-lg p-2"
                    value={leaveData.endDate}
                    onChange={e => setLeaveData({...leaveData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea 
                  className="w-full border rounded-lg p-2" 
                  rows={2}
                  value={leaveData.reason}
                  onChange={e => setLeaveData({...leaveData, reason: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="md:col-span-2 bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                <Send size={18} />
                Submit Request
              </button>
            </form>
          </div>

          {/* Leave History Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 overflow-hidden">
            <h2 className="text-2xl font-bold text-dark mb-6">Leave Status</h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {leaves.map((leave, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-primary">{leave.type}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{leave.status}</span>
                  </div>
                  <p className="text-xs text-secondary">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                </div>
              ))}
              {leaves.length === 0 && <p className="text-secondary text-sm">No leave requests found.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard