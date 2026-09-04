'use client'
import { useState } from 'react'
import { getSession } from '@/app/lib/auth'
import { supabase } from '@/app/lib/supabase'

export default function ProfilePage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = async () => {
    if (newPassword !== confirm) return setMsg('Passwords do not match')
    if (newPassword.length < 6) return setMsg('Minimum 6 characters')
    setLoading(true)
    const session = getSession()
    const { error } = await supabase
      .from('sellers')
      .update({ seller_password: newPassword, must_change_password: false })
      .eq('id', session?.id)
    setLoading(false)
    if (error) setMsg('Error: ' + error.message)
    else setMsg('Password changed successfully!')
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      <input type="password" placeholder="New password" value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        className="w-full border p-3 rounded mb-3" />
      <input type="password" placeholder="Confirm password" value={confirm}
        onChange={e => setConfirm(e.target.value)}
        className="w-full border p-3 rounded mb-3" />
      {msg && <p className="text-sm mb-3 text-red-600">{msg}</p>}
      <button onClick={handleChange} disabled={loading}
        className="w-full bg-red-600 text-white p-3 rounded font-bold">
        {loading ? 'Saving...' : 'Update Password'}
      </button>
    </div>
  )
}
