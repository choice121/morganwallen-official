import { Link } from 'react-router-dom'
import { Crown, Lock } from 'lucide-react'

interface VipGateProps {
  isLoggedIn: boolean
  isVip: boolean
  children: React.ReactNode
  label?: string
}

export default function VipGate({ isLoggedIn, isVip, children, label = 'VIP Exclusive' }: VipGateProps) {
  if (isVip) return <>{children}</>

  return (
    <div className="relative overflow-hidden rounded-sm">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40 scale-[1.02]">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/70 backdrop-blur-sm">
        <div className="text-center px-6">
          <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-3">
            {isLoggedIn ? <Crown size={20} className="text-gold-400" /> : <Lock size={20} className="text-gold-400" />}
          </div>
          <p className="text-gold-400 font-display text-xs uppercase tracking-widest mb-1">{label}</p>
          <p className="text-cream/60 text-sm mb-4">
            {isLoggedIn ? 'Upgrade to VIP to access this content' : 'Join to unlock exclusive content'}
          </p>
          <Link
            to="/join"
            className="inline-flex items-center gap-2 btn-gold py-2 px-5 text-xs"
          >
            <Crown size={13} fill="currentColor" />
            {isLoggedIn ? 'Go VIP' : 'Join Now'}
          </Link>
        </div>
      </div>
    </div>
  )
}
