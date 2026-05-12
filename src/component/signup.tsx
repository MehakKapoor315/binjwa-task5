import React, { useState } from 'react'
import { User, Mail, Lock, Phone, Building2, UserCheck } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    role: 'DEVELOPER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <div className="flex justify-center mb-8">
          <div className="bg-primary p-3 rounded-full">
            <UserCheck className="text-white" size={32} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-dark mb-2">Create Account</h1>
        <p className="text-center text-secondary mb-8">Join our CRM platform today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-secondary" size={20} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-secondary" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-secondary" size={20} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 text-secondary" size={20} />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Your Company"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Role *</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3 text-secondary" size={20} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="DEVELOPER">DEVELOPER</option>
                <option value="HR">HR Manager</option>
                <option value="admin">Admin</option>
                <option value="BDE">BDE</option>
                <option value="AI-ML">AI-ML Engineer</option>
                <option value="SEO">SEO Specialist</option>
                <option value="UI-UX">UI-UX Designer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-secondary" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-secondary" size={20} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-secondary">Already have an account? <Link to="/login" className="text-primary hover:underline font-semibold">Sign In</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Signup
