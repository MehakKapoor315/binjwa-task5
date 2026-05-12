import React, { useState, useEffect } from 'react'
import { CheckCircle2, Clock, AlertCircle, Plus, Search, Calendar, User, MoreVertical, Trash2, Edit2, Loader2, BarChart3 } from 'lucide-react'
import api from '../utils/api'

interface Task {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold'
  assignedTo: {
    _id: string
    name: string
    email: string
    role: string
  }
  completionPercentage: number
}

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Pending',
    assignedTo: '',
    completionPercentage: 0
  })

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user.role
  const userId = user.id

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const taskRes = await api.get('/tasks')
      setTasks(taskRes.data.data || [])
      
      // Only fetch users if authorized (for task assignment)
      if (userRole === 'admin' || userRole === 'HR') {
        const userRes = await api.get('/users')
        setUsers(userRes.data.data || [])
      }
      
      setError('')
    } catch (err: any) {
      console.error('Failed to fetch data', err)
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/tasks', newTask)
      setIsModalOpen(false)
      setNewTask({ title: '', description: '', startDate: '', endDate: '', status: 'Pending', assignedTo: '', completionPercentage: 0 })
      fetchData()
    } catch (err) {
      alert('Failed to create task')
    }
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return
    try {
      await api.put(`/tasks/${selectedTask._id}`, selectedTask)
      setIsViewModalOpen(false)
      setIsEditMode(false)
      fetchData()
      alert('Task updated successfully')
    } catch (err) {
      alert('Failed to update task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`)
        fetchData()
      } catch (err) {
        alert('Failed to delete task')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'On Hold': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignedTo?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="hidden">
          <h1 className="text-3xl font-bold text-dark mb-1">Task Management Board</h1>
          <p className="text-secondary text-sm">Assign, track and manage team operations</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition shadow-sm"
            />
          </div>
          {(userRole === 'admin' || userRole === 'HR') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition shadow-lg shadow-primary/20 font-bold whitespace-nowrap"
            >
              <Plus size={20} />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTasks.map((task) => (
          <div key={task._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                {(userRole === 'admin' || userRole === 'HR') && (
                  <button 
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h3 className="font-black text-dark text-lg mb-2 line-clamp-1 leading-tight">{task.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10 leading-relaxed font-medium">{task.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm text-gray-700 font-semibold bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                  <Calendar size={16} className="text-primary" />
                  <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 font-semibold bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                  {task.assignedTo?.profilePic ? (
                    <img src={task.assignedTo.profilePic} className="w-5 h-5 rounded-full object-cover" alt="" />
                  ) : (
                    <User size={16} className="text-primary" />
                  )}
                  <span className="text-dark">{task.assignedTo?.name || 'Unassigned'}</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 uppercase font-black">{task.assignedTo?.role}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-black text-dark uppercase tracking-tighter">Mission Progress</span>
                  <span className="font-black text-primary text-sm">{task.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner border border-gray-100">
                  <div 
                    className="bg-gradient-to-r from-primary to-purple-600 h-full transition-all duration-700 ease-out shadow-lg" 
                    style={{ width: `${task.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary">
                  {task.assignedTo?.name.charAt(0)}
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedTask(task)
                  setIsViewModalOpen(true)
                  setIsEditMode(false)
                }}
                className="text-white bg-primary hover:bg-purple-700 px-4 py-1.5 rounded-lg text-xs font-black shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                Intelligence Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-dark flex items-center gap-2">
                <BarChart3 className="text-primary" size={24} />
                Create New Mission
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400"
              >
                <AlertCircle size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="e.g. Implement Dashboard API"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition resize-none"
                    placeholder="Provide details about the task..."
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                    <input
                      type="date"
                      required
                      value={newTask.startDate}
                      onClick={(e) => (e.target as any).showPicker()}
                      onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                    <input
                      type="date"
                      required
                      value={newTask.endDate}
                      onClick={(e) => (e.target as any).showPicker()}
                      onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-white cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Assign To</label>
                  <select
                    required
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-white"
                  >
                    <option value="">Select User</option>
                    {/* Option to assign to self */}
                    {localStorage.getItem('user') && (
                      <option value={JSON.parse(localStorage.getItem('user')!).id}>
                        Assign to Me ({JSON.parse(localStorage.getItem('user')!).name})
                      </option>
                    )}
                    <optgroup label="Team Members">
                      {users.map(user => (
                        <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value as any})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Completion Percentage ({newTask.completionPercentage}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newTask.completionPercentage}
                    onChange={(e) => setNewTask({...newTask, completionPercentage: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
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
                  Deploy Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View/Edit Task Modal */}
      {isViewModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-dark flex items-center gap-2">
                <CheckCircle2 className="text-primary" size={24} />
                {isEditMode ? 'Modify Mission' : 'Mission Intelligence'}
              </h3>
              <button 
                onClick={() => {
                  setIsViewModalOpen(false)
                  setIsEditMode(false)
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400"
              >
                <AlertCircle size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateTask} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {isEditMode ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Task Title</label>
                        <input
                          type="text"
                          required
                          value={selectedTask.title}
                          onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                        <textarea
                          required
                          rows={3}
                          value={selectedTask.description}
                          onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="text-lg font-bold text-dark mb-1">{selectedTask.title}</h4>
                      <p className="text-secondary text-sm">{selectedTask.description}</p>
                    </>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Assigned To</p>
                  {isEditMode && (userRole === 'admin' || userRole === 'HR') ? (
                    <select
                      value={typeof selectedTask.assignedTo === 'object' ? selectedTask.assignedTo._id : selectedTask.assignedTo}
                      onChange={(e) => setSelectedTask({...selectedTask, assignedTo: e.target.value as any})}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition bg-white text-sm"
                    >
                      <option value="">Select User</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      <span className="text-sm font-bold text-dark">{selectedTask.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Timeline</p>
                  {isEditMode ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="date"
                        value={new Date(selectedTask.startDate).toISOString().split('T')[0]}
                        onChange={(e) => setSelectedTask({...selectedTask, startDate: e.target.value})}
                        className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
                      />
                      <input
                        type="date"
                        value={new Date(selectedTask.endDate).toISOString().split('T')[0]}
                        onChange={(e) => setSelectedTask({...selectedTask, endDate: e.target.value})}
                        className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <span className="text-sm font-bold text-dark">{new Date(selectedTask.startDate).toLocaleDateString()} - {new Date(selectedTask.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Current Status</label>
                  <select
                    disabled={!isEditMode}
                    value={selectedTask.status}
                    onChange={(e) => setSelectedTask({...selectedTask, status: e.target.value as any})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Completion Progress</label>
                  <div className="flex items-center gap-4">
                    <input
                      disabled={!isEditMode}
                      type="range"
                      min="0"
                      max="100"
                      value={selectedTask.completionPercentage}
                      onChange={(e) => setSelectedTask({...selectedTask, completionPercentage: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-bold text-primary w-10 text-right">{selectedTask.completionPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                {!isEditMode ? (
                  <>
                    {(userRole === 'admin' || userRole === 'HR') && (
                      <button
                        type="button"
                        onClick={() => setIsEditMode(true)}
                        className="flex-1 min-w-[140px] px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                      >
                        <User size={18} />
                        Reassign Task
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="flex-1 min-w-[140px] px-4 py-3 bg-primary hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} />
                      Modify Mission
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsViewModalOpen(false)}
                      className="flex-1 min-w-[140px] px-4 py-3 border border-gray-200 text-secondary font-bold rounded-xl hover:bg-gray-50 transition"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="flex-1 min-w-[140px] px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-lg shadow-green-500/20"
                    >
                      Apply Changes & Reassign
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 min-w-[140px] px-4 py-3 border border-gray-200 text-secondary font-bold rounded-xl hover:bg-gray-50 transition"
                    >
                      Cancel Edit
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskBoard
