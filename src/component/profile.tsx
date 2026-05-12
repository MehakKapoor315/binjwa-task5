import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Briefcase, Camera, Lock, Save, Loader2 } from 'lucide-react'
import api from '../utils/api'

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    designation: '',
    profilePic: '',
    password: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await api.get(`/users/${user.id}`)
      const userData = response.data.data
      setProfileData({
        ...profileData,
        name: userData.name || '',
        email: userData.email || '',
        mobileNumber: userData.mobileNumber || '',
        designation: userData.designation || '',
        profilePic: userData.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      })
    } catch (err) {
      console.error('Failed to fetch profile', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const updatePayload = { ...profileData }
      if (!updatePayload.password) delete (updatePayload as any).password
      
      const response = await api.put('/users/profile', updatePayload)
      const updatedUser = response.data.data
      
      // Update local state immediately
      setProfileData({
        ...profileData,
        ...updatedUser,
        password: '' // Clear password
      })

      // Update local storage for Navbar and other components
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ 
        ...currentUser, 
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        designation: updatedUser.designation,
        mobileNumber: updatedUser.mobileNumber
      }))
      
      alert('Profile updated successfully! Refreshing view...')
      window.location.reload() // Force a reload to sync all components (Navbar etc)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileData(prev => ({ ...prev, profilePic: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-primary h-32 relative">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="relative group">
                <img 
                  src={profileData.profilePic} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg bg-white"
                />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20 pb-8 px-8 text-center">
            <h2 className="text-2xl font-black text-dark">{profileData.name}</h2>
            <p className="text-primary font-bold uppercase text-xs tracking-widest">{profileData.designation}</p>
          </div>

          <form onSubmit={handleUpdate} className="px-8 pb-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profileData.mobileNumber}
                    onChange={e => setProfileData({...profileData, mobileNumber: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profileData.designation}
                    onChange={e => setProfileData({...profileData, designation: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Picture</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-pic-picker"
                  />
                  <label 
                    htmlFor="profile-pic-picker"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-white hover:border-primary hover:text-primary transition cursor-pointer font-bold text-sm text-secondary"
                  >
                    <Camera size={20} />
                    {profileData.profilePic.startsWith('data:') ? 'Change Selected Photo' : 'Choose Pic from Device'}
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Change Password (Leave blank to keep current)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    value={profileData.password}
                    onChange={e => setProfileData({...profileData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-primary hover:bg-purple-700 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
