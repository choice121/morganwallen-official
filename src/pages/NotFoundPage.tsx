import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Music, Ticket } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <p className="font-display text-[8rem] font-black text-gold-500/10 leading-none select-none">
          404
        </p>
        <h1 className="font-serif text-4xl text-cream -mt-8 mb-4">
          Page Not Found
        </h1>
        <p className="text-cream/50 mb-10 leading-relaxed">
          Looks like this page hit the road. Head back home or explore the site.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-gold px-8 py-3 text-sm inline-flex items-center justify-center gap-2">
            <Home size={15} /> Back Home
          </Link>
          <Link to="/music" className="btn-outline px-8 py-3 text-sm inline-flex items-center justify-center gap-2">
            <Music size={15} /> Music
          </Link>
          <Link to="/tour" className="btn-outline px-8 py-3 text-sm inline-flex items-center justify-center gap-2">
            <Ticket size={15} /> Tour
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
