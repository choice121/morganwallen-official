import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Share2, Crown, Star } from 'lucide-react'
import { Profile } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface FanCardProps {
  profile: Profile
  email: string
}

function padMember(n: number | null) {
  if (!n) return '000000'
  return String(n).padStart(6, '0')
}

function joinYear(created_at: string) {
  return new Date(created_at).getFullYear()
}

export default function FanCard({ profile, email }: FanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isVip = profile.tier === 'vip'
  const displayName = profile.full_name || email.split('@')[0]

  async function handleDownload() {
    try {
      const { default: html2canvas } = await import('html2canvas')
      if (!cardRef.current) return
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `morgan-wallen-fan-card-${padMember(profile.member_number)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Fan card downloaded!')
    } catch {
      toast.error('Download failed — try a screenshot instead')
    }
  }

  async function handleShare() {
    const text = isVip
      ? `I'm a VIP member #${padMember(profile.member_number)} of the Morgan Wallen Fan Club! 🤠 #MorganWallen #ClubWallen`
      : `I'm fan #${padMember(profile.member_number)} of the official Morgan Wallen Fan Club! 🤠 #MorganWallen`
    if (navigator.share) {
      await navigator.share({ text, url: 'https://morganwallen.com' })
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    }
  }

  return (
    <div className="space-y-4">
      {/* The card itself */}
      <div ref={cardRef} className={`relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden select-none ${isVip ? 'shadow-2xl shadow-gold-500/30' : 'shadow-xl shadow-dark-900/50'}`} style={{ aspectRatio: '1.586' }}>

        {/* Background */}
        {isVip ? (
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-[#1a1200] to-dark-900">
            {/* Gold shimmer lines */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(105deg, transparent, transparent 40px, rgba(212,175,55,0.15) 40px, rgba(212,175,55,0.15) 41px)'
            }} />
            {/* Glow orb */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'repeating-linear-gradient(105deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px)'
            }} />
          </div>
        )}

        {/* Card border */}
        <div className={`absolute inset-0 rounded-2xl border ${isVip ? 'border-gold-400/40' : 'border-cream/10'}`} />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-6">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-display text-xs uppercase tracking-[0.3em] ${isVip ? 'text-gold-400' : 'text-cream/50'}`}>
                Morgan Wallen
              </p>
              <p className={`font-display text-[10px] uppercase tracking-widest mt-0.5 ${isVip ? 'text-gold-300/70' : 'text-cream/30'}`}>
                Official Fan Club
              </p>
            </div>
            {isVip ? (
              <div className="flex items-center gap-1.5 bg-gold-500/20 border border-gold-400/40 px-2.5 py-1 rounded-full">
                <Crown size={10} className="text-gold-400" fill="currentColor" />
                <span className="text-gold-400 font-display text-[10px] uppercase tracking-widest">VIP</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-cream/5 border border-cream/10 px-2.5 py-1 rounded-full">
                <Star size={10} className="text-cream/40" />
                <span className="text-cream/40 font-display text-[10px] uppercase tracking-widest">Fan</span>
              </div>
            )}
          </div>

          {/* Center — decorative MW monogram */}
          <div className="flex justify-center">
            <span className={`font-serif text-6xl font-bold leading-none ${isVip ? 'text-gold-500/20' : 'text-cream/5'}`}>
              MW
            </span>
          </div>

          {/* Bottom row */}
          <div>
            <p className={`font-serif text-lg font-semibold leading-tight ${isVip ? 'text-gold-100' : 'text-cream'}`}>
              {displayName}
            </p>
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className={`font-display text-[9px] uppercase tracking-[0.2em] ${isVip ? 'text-gold-400/60' : 'text-cream/30'}`}>
                  Member No.
                </p>
                <p className={`font-display text-xl font-bold tracking-widest mt-0.5 ${isVip ? 'text-gold-400' : 'text-cream/60'}`}>
                  #{padMember(profile.member_number)}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-display text-[9px] uppercase tracking-[0.2em] ${isVip ? 'text-gold-400/60' : 'text-cream/30'}`}>
                  Member Since
                </p>
                <p className={`font-display text-sm font-semibold mt-0.5 ${isVip ? 'text-gold-300' : 'text-cream/50'}`}>
                  {isVip && profile.vip_since
                    ? new Date(profile.vip_since).getFullYear()
                    : joinYear(profile.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-gold-500/20 hover:border-gold-400/50 rounded-sm text-cream/70 hover:text-cream transition-all text-xs font-display uppercase tracking-widest"
        >
          <Download size={13} />
          Download
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-gold-500/20 hover:border-gold-400/50 rounded-sm text-cream/70 hover:text-cream transition-all text-xs font-display uppercase tracking-widest"
        >
          <Share2 size={13} />
          Share
        </motion.button>
      </div>
    </div>
  )
}
