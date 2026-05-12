import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './component/login'
import Signup from './component/signup'
import Dashboard from './component/dashboard'
import Navbar from './component/navbar'
import HRDashboard from './component/hr-dashboard'
import AdminDashboard from './component/admin-dashboard'
import TaskBoard from './component/task-board'
import Profile from './component/profile'


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (user && token) {
      setIsAuthenticated(true)
      setUserRole(JSON.parse(user).role)
    }
    setLoading(false)
  }, [])

  const handleLogin = (role: string) => {
    setIsAuthenticated(true)
    setUserRole(role)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUserRole(null)
  }

  if (loading) return null

  return (
    <Router>
      {isAuthenticated && <Navbar userRole={userRole} onLogout={handleLogout} />}
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard userRole={userRole} />} />
            <Route 
              path="/hr-dashboard" 
              element={userRole === 'HR' || userRole === 'admin' ? <HRDashboard /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/admin-dashboard" 
              element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/task-board" 
              element={<TaskBoard />} 
            />
            <Route 
              path="/profile" 
              element={<Profile />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App