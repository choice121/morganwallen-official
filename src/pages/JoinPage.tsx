import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Crown, Star, Check, Ticket, Image, Video, Newspaper, Hash, CreditCard } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const FREE_PERKS = [
  { icon: Star,      text: 'Official Fan Card with member number' },
  { icon: Newspaper, text: 'Access to all public news & content' },
  { icon: Ticket,    text: 'General ticket announcements' },
]

const VIP_PERKS = [
  { icon: Crown,     text: 'Exclusive gold VIP Fan Card' },
  { icon: Hash,      text: 'Unique member number — earlier = lower' },
  { icon: Ticket,    text: '48-hour early tour ticket access' },
  { icon: Newspaper, text: 'VIP-only news & exclusive articles' },
  { icon: Image,     text: 'Members-only gallery photos' },
  { icon: Video,     text: 'Exclusive behind-the-scenes videos' },
  { icon: CreditCard,text: 'Priority access to new releases' },
]

export default function JoinPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isVip = profile?.tier === 'vip'
  const isFan = !!user && !isVip

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/10 blur-3xl rounded-full" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-4 py-1.5 rounded-full mb-6">
              <Crown size={14} className="text-gold-400" fill="currentColor" />
              <span className="text-gold-400 font-display text-xs uppercase tracking-widest">Club Wallen</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-cream leading-tight">
              Join the <span className="shimmer-text">Inner Circle</span>
            </h1>
            <p className="mt-6 text-cream/60 text-lg max-w-xl mx-auto">
              Become an official member of the Morgan Wallen fan club. Get your digital fan card, exclusive content, and early access to everything.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Fan — free */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-dark-800 border border-cream/10 rounded-sm p-8 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-cream/5 border border-cream/10 flex items-center justify-center">
                <Star size={16} className="text-cream/50" />
              </div>
              <div>
                <p className="font-display text-xs uppercase tracking-widest text-cream/40">Fan Member</p>
                <p className="font-serif text-xl text-cream">Free</p>
              </div>
            </div>
            <p className="text-cream/40 text-sm mt-3 mb-6">
              Create an account and get your official fan card with a unique member number.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {FREE_PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Check size={14} className="text-cream/40 mt-0.5 flex-shrink-0" />
                  <span className="text-cream/60 text-sm">{text}</span>
                </li>
              ))}
            </ul>
            {user ? (
              <Link to="/account" className="btn-outline w-full justify-center text-sm py-3">
                View My Card
              </Link>
            ) : (
              <Link to="/login" className="btn-outline w-full justify-center text-sm py-3">
                Sign Up Free
              </Link>
            )}
          </motion.div>

          {/* VIP — paid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="relative bg-gradient-to-br from-dark-800 via-[#1a1200] to-dark-900 border border-gold-500/40 rounded-sm p-8 flex flex-col overflow-hidden shadow-2xl shadow-gold-500/10"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 blur-3xl rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />

            {/* Most popular badge */}
            <div className="absolute top-4 right-4 bg-gold-500 text-dark-900 text-[10px] font-display font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Best
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center">
                <Crown size={16} className="text-gold-400" fill="currentColor" />
              </div>
              <div>
                <p className="font-display text-xs uppercase tracking-widest text-gold-400/70">VIP Member</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-serif text-xl text-gold-100">$9.99</p>
                  <span className="text-cream/40 text-xs">/ month</span>
                </div>
              </div>
            </div>
            <p className="text-cream/50 text-sm mt-3 mb-6">
              The full Club Wallen experience — exclusive content, early access, and your gold VIP card.
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {VIP_PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Check size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />
                  <span className="text-cream/70 text-sm">{text}</span>
                </li>
              ))}
            </ul>

            {isVip ? (
              <div className="w-full text-center py-3 bg-gold-500/10 border border-gold-500/30 rounded-sm text-gold-400 font-display text-xs uppercase tracking-widest">
                You're Already VIP ✓
              </div>
            ) : isFan ? (
              <VipRequestButton />
            ) : (
              <Link to="/login?next=/join" className="btn-gold w-full justify-center text-sm py-3 relative z-10">
                <Crown size={14} fill="currentColor" />
                Join VIP Now
              </Link>
            )}
          </motion.div>
        </div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-cream/30 text-xs mt-10 font-display uppercase tracking-widest"
        >
          Secure billing · Cancel anytime · Instant access
        </motion.p>
      </section>

      {/* FAQ */}
      <section className="pb-24 px-4 max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl text-cream text-center mb-8">Common Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What is my member number?', a: 'Your member number is unique to you and assigned when you sign up. The earlier you join, the lower your number — it\'s a badge of honor for OG fans.' },
            { q: 'Can I download my fan card?', a: 'Yes — your digital fan card can be downloaded as a PNG image straight from your account page. Share it on social, print it, or keep it.' },
            { q: 'How do I access VIP-only content?', a: 'Once your account is upgraded to VIP, all exclusive content unlocks automatically on the news, gallery, and videos pages.' },
            { q: 'When does early tour access kick in?', a: 'VIP members see new tour dates 48 hours before they go public. Make sure you\'re signed in to see them.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-dark-800 border border-gold-500/10 rounded-sm p-5">
              <p className="font-serif text-cream font-medium mb-2">{q}</p>
              <p className="text-cream/50 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function VipRequestButton() {
  const navigate = useNavigate()

  async function handleRequest() {
    navigate('/contact?subject=VIP+Membership+Request')
  }

  return (
    <button
      onClick={handleRequest}
      className="btn-gold w-full justify-center text-sm py-3 relative z-10"
    >
      <Crown size={14} fill="currentColor" />
      Request VIP Access
    </button>
  )
}
