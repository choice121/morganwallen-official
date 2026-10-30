import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { Video } from '../../lib/supabase'
import { getVideos } from '../../lib/dataService'
import SectionHeader from '../ui/SectionHeader'

export default function VideosSection() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    getVideos().then((data) => {
      setVideos(data.slice(0, 3))
    })
  }, [])

  return (
    <section className="section-padding bg-dark-800">
      <div className="container-xl">
        <SectionHeader subtitle="Watch" title="Music Videos" description="Official music videos and exclusive acoustic sessions." />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group bg-dark-700 rounded-sm overflow-hidden card-hover"
            >
              <a
                href={video.youtube_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="block relative aspect-video overflow-hidden bg-dark-900"
              >
                <img
                  src={video.thumbnail || ''}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-dark-900/40 group-hover:bg-dark-900/20 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                    <Play size={20} className="text-dark-900 ml-1" fill="currentColor" />
                  </div>
                </div>
              </a>

              <div className="p-5">
                <span className="text-gold-400/70 text-xs font-display uppercase tracking-widest mb-1 block">
                  {video.category}
                </span>
                <h3 className="font-serif text-lg font-semibold text-cream group-hover:text-gold-400 transition-colors line-clamp-1">
                  {video.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link to="/videos" className="btn-outline">
            View All Videos
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
