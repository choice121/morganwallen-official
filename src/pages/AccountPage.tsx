import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, LogOut, Edit, Ticket, Image, Video, Newspaper, Crown, Star, Save, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { PageLoader } from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import FanCard from '../components/ui/FanCard'

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (profile?.full_name) setEditName(profile.full_name)
    else if (user?.email) setEditName(user.email.split('@')[0])
  }, [profile, user])

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      toast.error('Failed to save profile')
    } else {
      toast.success('Profile updated!')
      setEditing(false)
      window.location.reload()
    }
  }

  if (loading) return <PageLoader />
  if (!user) return null

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Fan'
  const isVip = profile?.tier === 'vip'

  const VIP_PERKS = [
    { icon: Ticket,    title: '48-Hr Early Access',    desc: 'See tour dates 48 hours before the public.' },
    { icon: Newspaper, title: 'VIP-Only News',          desc: 'Exclusive articles and announcements.' },
    { icon: Image,     title: 'Private Gallery',        desc: 'Members-only behind-the-scenes photos.' },
    { icon: Video,     title: 'Exclusive Videos',       desc: 'Studio sessions and private content.' },
  ]

  const FAN_PERKS = [
    { icon: Ticket,    title: 'Ticket Alerts',     desc: 'Get notified when new dates drop.' },
    { icon: Newspaper, title: 'Latest News',        desc: 'All public news and updates.' },
  ]

  return (
    <div className="min-h-screen bg-dark-800 pt-24">
      {/* Header */}
      <div className="py-12 px-4 bg-dark-900 border-b border-gold-500/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="section-subtitle mb-2">Welcome Back</p>
            <h1 className="section-title">My Account</h1>
          </div>
          {isVip && (
            <div className="hidden md:flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-4 py-2 rounded-full">
              <Crown size={14} className="text-gold-400" fill="currentColor" />
              <span className="text-gold-400 font-display text-xs uppercase tracking-widest">VIP Member</span>
            </div>
          )}
        </div>
      </div>

      <div className="section-padding">
        <div className="max-w-5xl mx-auto px-4 space-y-8">

          {/* Top row: profile card + fan card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-700 gold-border rounded-sm p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={26} className="text-gold-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-xl text-cream truncate">{displayName}</h2>
                  <p className="text-cream/40 text-sm truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {isVip ? (
                      <span className="inline-flex items-center gap-1 bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-full">
                        <Crown size={9} fill="currentColor" /> VIP Member
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-cream/5 border border-cream/10 text-cream/40 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-full">
                        <Star size={9} /> Fan Member
                      </span>
                    )}
                    {profile?.is_admin && (
                      <span className="inline-block bg-gold-500/20 text-gold-400 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm border-t border-gold-500/10 pt-4">
                <div className="flex justify-between py-1">
                  <span className="text-cream/40">Member No.</span>
                  <span className="text-cream font-display tracking-wider">
                    {profile?.member_number ? `#${String(profile.member_number).padStart(6, '0')}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-cream/40">Member Since</span>
                  <span className="text-cream">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                {isVip && profile?.vip_since && (
                  <div className="flex justify-between py-1">
                    <span className="text-cream/40">VIP Since</span>
                    <span className="text-gold-400">{new Date(profile.vip_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-600 hover:bg-dark-500 rounded-sm transition-colors text-cream/70 hover:text-cream text-xs font-display uppercase tracking-widest"
                >
                  <Edit size={13} /> Edit
                </button>
                <button onClick={handleSignOut}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-600 hover:bg-red-500/10 rounded-sm transition-colors text-cream/50 hover:text-red-400 text-xs font-display uppercase tracking-widest">
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </motion.div>

            {/* Fan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-700 gold-border rounded-sm p-6"
            >
              <h3 className="font-serif text-lg text-cream mb-4">Your Fan Card</h3>
              {profile ? (
                <FanCard profile={profile} email={user.email ?? ''} />
              ) : (
                <div className="aspect-[1.586] bg-dark-800 rounded-xl animate-pulse max-w-sm mx-auto" />
              )}
            </motion.div>
          </div>

          {/* Edit form */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-700 gold-border rounded-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl text-cream">Edit Profile</h3>
                <button onClick={() => setEditing(false)} className="text-cream/40 hover:text-cream transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-xs font-display uppercase tracking-widest text-cream/50 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    className="w-full bg-dark-800 border border-gold-500/20 rounded-sm px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-gold-400/50 transition-colors text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" loading={saving} size="sm">
                    <Save size={14} /> Save Changes
                  </Button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="px-4 py-2 text-sm text-cream/50 hover:text-cream transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Perks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-700 gold-border rounded-sm p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl text-cream">
                {isVip ? 'Your VIP Perks' : 'Your Fan Perks'}
              </h3>
              {!isVip && (
                <Link to="/join" className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 font-display uppercase tracking-widest transition-colors">
                  <Crown size={12} fill="currentColor" /> Upgrade to VIP
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(isVip ? VIP_PERKS : FAN_PERKS).map(({ icon: Icon, title, desc }) => (
                <div key={title} className={`p-4 rounded-sm border transition-colors ${isVip ? 'bg-dark-800 border-gold-500/20 hover:border-gold-500/40' : 'bg-dark-800 border-gold-500/10 hover:border-gold-500/20'}`}>
                  <Icon size={18} className={isVip ? 'text-gold-400 mb-2' : 'text-cream/30 mb-2'} />
                  <h4 className="text-cream font-medium text-sm">{title}</h4>
                  <p className="text-cream/40 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}

              {/* Upgrade prompt card for fan members */}
              {!isVip && (
                <Link to="/join" className="p-4 rounded-sm border border-dashed border-gold-500/20 hover:border-gold-500/40 bg-gold-500/5 hover:bg-gold-500/10 transition-all group col-span-2 flex items-center gap-4">
                  <Crown size={22} className="text-gold-400/50 group-hover:text-gold-400 transition-colors flex-shrink-0" fill="currentColor" />
                  <div>
                    <h4 className="text-gold-400 font-medium text-sm">Unlock VIP Perks</h4>
                    <p className="text-cream/40 text-xs mt-0.5">Early access, exclusive content & more →</p>
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
