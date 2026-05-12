import React from 'react'
import { Menu, LogOut, User, Home, Users, Settings, CheckCircle2, UserCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface NavbarProps {
  userRole: string | null
  onLogout: () => void
}

const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <img src="/logo.png" alt="logo" style={{ height: '50px' }} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>

            {(userRole === 'HR' || userRole === 'admin') && (
              <Link to="/hr-dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
                <Users size={20} />
                <span>HR Dashboard</span>
              </Link>
            )}

            {userRole === 'admin' && (
              <Link to="/admin-dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
                <Settings size={20} />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link to="/task-board" className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-xl transition font-black text-sm uppercase tracking-wide">
              <CheckCircle2 size={20} />
              <span>Task Board</span>
            </Link>

            <Link to="/profile" className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-xl transition font-black text-sm uppercase tracking-wide group">
              {user.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/20 group-hover:border-white/50 transition-all shadow-sm"
                />
              ) : (
                <UserCircle size={20} />
              )}
              <span>Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition px-4 py-2"
              onClick={() => setIsOpen(false)}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </Link>

            {(userRole === 'HR' || userRole === 'admin') && (
              <Link
                to="/hr-dashboard"
                className="flex items-center gap-2 hover:opacity-80 transition px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                <Users size={20} />
                <span>HR Dashboard</span>
              </Link>
            )}

            {userRole === 'admin' && (
              <Link
                to="/admin-dashboard"
                className="flex items-center gap-2 hover:opacity-80 transition px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                <Settings size={20} />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link
              to="/task-board"
              className="flex items-center gap-2 hover:opacity-80 transition px-4 py-2"
              onClick={() => setIsOpen(false)}
            >
              <CheckCircle2 size={20} />
              <span>Task Board</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 hover:opacity-80 transition px-4 py-2"
              onClick={() => setIsOpen(false)}
            >
              {user.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <User size={20} />
              )}
              <span className="font-bold">Profile</span>
            </Link>

            <button
              onClick={() => {
                handleLogout()
                setIsOpen(false)
              }}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition mx-4"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
