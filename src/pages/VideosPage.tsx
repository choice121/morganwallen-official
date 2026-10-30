import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { Video } from '../lib/supabase'
import { getVideos } from '../lib/dataService'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVideos().then((data) => {
      setVideos(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-dark-800 pt-24">
      <div className="relative py-20 px-4 bg-dark-900 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="section-subtitle mb-4">Official Channel</p>
          <h1 className="section-title">Videos</h1>
          <p className="mt-4 text-cream/50 max-w-xl">
            Watch official music videos, live performances, and backstage tour sessions.
          </p>
        </div>
      </div>

      <div className="section-padding">
        <div className="container-xl">
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {videos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
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
          )}
        </div>
      </div>
    </div>
  )
}
