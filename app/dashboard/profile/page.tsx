'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, setSession } from '@/app/lib/auth'
import { supabase } from '@/app/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [msg,         setMsg]         = useState('')
  const [msgType,     setMsgType]     = useState<'error' | 'success'>('error')
  const [loading,     setLoading]     = useState(false)

  const session = getSession()
  const mustChange = session?.must_change_password === true

  const handleChange = async () => {
    if (newPassword !== confirm) { setMsgType('error'); return setMsg('Passwords do not match') }
    if (newPassword.length < 6)  { setMsgType('error'); return setMsg('Minimum 6 characters') }
    setLoading(true)
    const { error } = await supabase
      .from('sellers')
      .update({ seller_password: newPassword, must_change_password: false })
      .eq('id', session?.id)
    setLoading(false)
    if (error) {
      setMsgType('error')
      setMsg('Error: ' + error.message)
    } else {
      if (session) setSession({ ...session, must_change_password: false })
      setMsgType('success')
      setMsg('Password changed successfully! Redirecting…')
      setNewPassword('')
      setConfirm('')
      setTimeout(() => router.push('/dashboard'), 1500)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      {mustChange && (
        <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 font-medium">
          You must set a new password before accessing the dashboard.
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />
      {msg && (
        <p className={`text-sm mb-3 ${msgType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </p>
      )}
      <button
        onClick={handleChange}
        disabled={loading}
        className="w-full bg-red-600 text-white p-3 rounded font-bold disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Update Password'}
      </button>
    </div>
  )
}
