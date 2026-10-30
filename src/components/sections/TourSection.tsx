import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Ticket } from 'lucide-react'
import { TourDate } from '../../lib/supabase'
import { getTourDates } from '../../lib/dataService'
import { format } from 'date-fns'
import SectionHeader from '../ui/SectionHeader'

export default function TourSection() {
  const [dates, setDates] = useState<TourDate[]>([])

  useEffect(() => {
    getTourDates(true).then((data) => {
      setDates(data.slice(0, 5))
    })
  }, [])

  return (
    <section className="section-padding bg-dark-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
        <div className="text-right text-[20rem] font-display font-black text-gold-500 leading-none select-none">
          TOUR
        </div>
      </div>

      <div className="container-xl relative z-10">
        <SectionHeader subtitle="On the Road" title="Tour Dates" description="Don't miss Morgan live on the Still The Problem 2026 Stadium Tour." />

        <div className="mt-16 space-y-3">
          {dates.map((date, i) => (
            <motion.div
              key={date.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-dark-800 gold-border rounded-sm hover:border-gold-400/50 hover:bg-dark-700/50 transition-all duration-200"
            >
              {/* Date block */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-2xl font-display font-black text-gold-400 leading-none">
                  {format(new Date(date.event_date + 'T00:00:00'), 'dd')}
                </div>
                <div className="text-xs text-cream/50 uppercase tracking-widest font-display">
                  {format(new Date(date.event_date + 'T00:00:00'), 'MMM')}
                </div>
                <div className="text-xs text-cream/30">
                  {format(new Date(date.event_date + 'T00:00:00'), 'yyyy')}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-12 bg-gold-500/20 flex-shrink-0" />

              {/* Location info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-cream font-semibold text-lg font-serif">
                  <MapPin size={15} className="text-gold-400 flex-shrink-0" />
                  <span>{date.city}{date.state ? `, ${date.state}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-cream/50 text-sm">
                  <span>{date.venue}</span>
                  {date.event_time && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Calendar size={12} />{date.event_time}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status / Ticket */}
              <div className="flex-shrink-0">
                {date.is_sold_out ? (
                  <span className="px-4 py-2 text-xs font-display uppercase tracking-widest text-red-400/70 border border-red-500/20 rounded-sm">
                    Sold Out
                  </span>
                ) : (
                  <Link
                    to={`/tickets/${date.id}`}
                    className="btn-gold py-2 px-5 text-xs inline-flex items-center gap-2"
                  >
                    <Ticket size={14} />
                    Get Tickets
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link to="/tour" className="btn-outline">View All Dates</Link>
        </motion.div>
      </div>
    </section>
  )
}
