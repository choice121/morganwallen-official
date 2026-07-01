import { useEffect, useState } from 'react'
import { Crown, Star, Search, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase, Profile } from '../../lib/supabase'
import toast from 'react-hot-toast'

type MemberRow = Profile & { email?: string }

export default function MembersAdmin() {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'member_number', dir: 'asc' })

  async function fetchMembers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order(sort.col === 'member_number' ? 'member_number' : 'created_at', { ascending: sort.dir === 'asc', nullsFirst: false })
    if (error) {
      toast.error('Failed to load members')
    } else {
      setMembers((data ?? []) as MemberRow[])
    }
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [sort])

  async function toggleTier(member: MemberRow) {
    const newTier = member.tier === 'vip' ? 'fan' : 'vip'
    setUpdating(member.id)
    const updates: Partial<Profile> = {
      tier: newTier,
      vip_since: newTier === 'vip' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', member.id)
    if (error) {
      toast.error('Failed to update member')
    } else {
      toast.success(`${member.full_name || 'Member'} is now ${newTier.toUpperCase()}`)
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, ...updates } : m))
    }
    setUpdating(null)
  }

  function cycleSort(col: string) {
    setSort(prev => prev.col === col
      ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { col, dir: 'asc' }
    )
  }

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return (
      (m.full_name ?? '').toLowerCase().includes(q) ||
      (m.username ?? '').toLowerCase().includes(q)
    )
  })

  const vipCount = members.filter(m => m.tier === 'vip').length
  const fanCount = members.filter(m => m.tier !== 'vip').length

  function SortIcon({ col }: { col: string }) {
    if (sort.col !== col) return null
    return sort.dir === 'asc' ? <ChevronUp size={12} className="inline ml-1" /> : <ChevronDown size={12} className="inline ml-1" />
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: members.length, color: 'text-cream' },
          { label: 'VIP', value: vipCount, color: 'text-gold-400' },
          { label: 'Fan', value: fanCount, color: 'text-cream/50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-dark-800 border border-gold-500/10 rounded-sm p-4 text-center">
            <p className={`font-serif text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-cream/40 text-xs font-display uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
          <input
            type="text"
            placeholder="Search by name or username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-dark-800 border border-gold-500/10 rounded-sm pl-9 pr-4 py-2.5 text-cream text-sm placeholder-cream/30 focus:outline-none focus:border-gold-400/40"
          />
        </div>
        <button
          onClick={fetchMembers}
          className="px-4 py-2.5 bg-dark-800 border border-gold-500/10 rounded-sm text-cream/50 hover:text-cream transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-gold-500/10 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-500/10 bg-dark-900/50">
                <th
                  className="text-left px-4 py-3 text-cream/40 font-display text-xs uppercase tracking-widest cursor-pointer hover:text-cream/70"
                  onClick={() => cycleSort('member_number')}
                >
                  # <SortIcon col="member_number" />
                </th>
                <th className="text-left px-4 py-3 text-cream/40 font-display text-xs uppercase tracking-widest">Name</th>
                <th
                  className="text-left px-4 py-3 text-cream/40 font-display text-xs uppercase tracking-widest cursor-pointer hover:text-cream/70"
                  onClick={() => cycleSort('created_at')}
                >
                  Joined <SortIcon col="created_at" />
                </th>
                <th className="text-left px-4 py-3 text-cream/40 font-display text-xs uppercase tracking-widest">Tier</th>
                <th className="text-left px-4 py-3 text-cream/40 font-display text-xs uppercase tracking-widest">VIP Since</th>
                <th className="text-right px-4 py-3 text-cream/40 font-display text-xs uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/5">
              {loading ? (
                Array(5).fill(null).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(null).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-dark-700 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-cream/30">No members found</td>
                </tr>
              ) : filtered.map(member => (
                <tr key={member.id} className="hover:bg-dark-700/40 transition-colors">
                  <td className="px-4 py-3 font-display text-xs text-cream/40">
                    {member.member_number ? `#${String(member.member_number).padStart(6, '0')}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-cream font-medium">{member.full_name || <span className="text-cream/30 italic">No name</span>}</p>
                    {member.username && <p className="text-cream/30 text-xs">@{member.username}</p>}
                  </td>
                  <td className="px-4 py-3 text-cream/50 text-xs">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {member.tier === 'vip' ? (
                      <span className="inline-flex items-center gap-1 bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-full">
                        <Crown size={9} fill="currentColor" /> VIP
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-cream/5 border border-cream/10 text-cream/40 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded-full">
                        <Star size={9} /> Fan
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cream/40 text-xs">
                    {member.vip_since ? new Date(member.vip_since).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleTier(member)}
                      disabled={updating === member.id}
                      className={`text-xs font-display uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-all disabled:opacity-50 ${
                        member.tier === 'vip'
                          ? 'border-cream/10 text-cream/40 hover:border-red-400/30 hover:text-red-400'
                          : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'
                      }`}
                    >
                      {updating === member.id ? '…' : member.tier === 'vip' ? 'Downgrade' : 'Make VIP'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
