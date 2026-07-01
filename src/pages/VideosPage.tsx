import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Youtube, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, Video } from '../lib/supabase'
import { PLACEHOLDER_IMAGES } from '../lib/imagekit'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES_V = ['all', 'music_video', 'live', 'behind_scenes', 'lyric_video', 'interview']

function catLabel(cat: string) {
  const map: Record<string, string> = {
    all: 'All', music_video: 'Music Video', behind_scenes: 'Behind the Scenes',
    lyric_video: 'Lyric Video', interview: 'Interview', live: 'Live',
  }
  return map[cat] ?? cat
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('all')
  const { user, profile } = useAuth()
  const isVip = profile?.tier === 'vip'

  useEffect(() => {
    const q = supabase
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
    if (catFilter !== 'all') q.eq('category', catFilter)
    q.then(({ data }) => {
      if (data) setVideos(data as Video[])
      setLoading(false)
    })
  }, [catFilter])

  return (
    <div className="min-h-screen bg-dark-800 pt-24">
      <div className="py-20 px-4 bg-dark-900">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
          <div>
            <p className="section-subtitle mb-4">Watch</p>
            <h1 className="section-title">Videos</h1>
          </div>
          {!isVip && (
            <Link to="/join" className="hidden md:flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 transition-colors px-4 py-2 rounded-full mb-2">
              <Crown size={13} className="text-gold-400" fill="currentColor" />
              <span className="text-gold-400 font-display text-xs uppercase tracking-widest">Unlock VIP Videos</span>
            </Link>
          )}
        </div>
      </div>

      <div className="section-padding">
        <div className="container-xl">
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES_V.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-4 py-2 text-xs font-display uppercase tracking-widest rounded-sm transition-all ${
                  catFilter === cat ? 'bg-gold-500 text-dark-900' : 'border border-gold-500/20 text-cream/50 hover:border-gold-500/40'
                }`}
              >
                {catLabel(cat)}
              </button>
            ))}
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, i) => {
                const locked = video.is_vip_only && !isVip
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`group relative rounded-sm overflow-hidden gold-border ${i === 0 ? 'md:col-span-2' : ''} ${locked ? '' : 'card-hover cursor-pointer'}`}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={video.thumbnail || PLACEHOLDER_IMAGES.video}
                        alt={video.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ${locked ? 'blur-sm scale-105' : 'group-hover:scale-105'}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.video }}
                      />

                      {/* Normal play button for unlocked */}
                      {!locked && (
                        <div className="absolute inset-0 bg-dark-900/40 group-hover:bg-dark-900/20 transition-colors flex items-center justify-center">
                          <a
                            href={video.youtube_url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="w-16 h-16 rounded-full bg-gold-500/90 backdrop-blur flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform"
                            onClick={e => e.stopPropagation()}
                          >
                            <Play size={22} className="text-dark-900 ml-1" fill="currentColor" />
                          </a>
                        </div>
                      )}

                      {/* VIP lock overlay */}
                      {locked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/65 backdrop-blur-[2px]">
                          <div className="text-center px-6">
                            <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-3">
                              <Crown size={22} className="text-gold-400" fill="currentColor" />
                            </div>
                            <p className="text-gold-400 font-display text-xs uppercase tracking-widest mb-1">VIP Exclusive</p>
                            <p className="text-cream/60 text-sm mb-4">
                              {user ? 'Upgrade to VIP to watch this' : 'Join to unlock exclusive videos'}
                            </p>
                            <Link to="/join" className="inline-flex items-center gap-2 btn-gold py-2 px-5 text-xs">
                              <Crown size={12} fill="currentColor" />
                              {user ? 'Go VIP' : 'Join Now'}
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Category tag */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {video.is_vip_only && (
                          <span className="bg-dark-900/80 border border-gold-500/50 text-gold-400 text-[10px] font-display uppercase tracking-widest px-2 py-1 flex items-center gap-1 rounded">
                            <Crown size={8} fill="currentColor" /> VIP
                          </span>
                        )}
                        <span className="bg-dark-900/80 text-xs font-display uppercase tracking-wider px-2 py-1 flex items-center gap-1 rounded text-cream/70">
                          <Youtube size={11} className="text-red-500" />
                          {catLabel(video.category)}
                        </span>
                      </div>

                      {/* Title overlay */}
                      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-900 to-transparent ${locked ? 'blur-sm' : ''}`}>
                        <h3 className="font-serif text-cream font-semibold">{video.title}</h3>
                        {video.description && <p className="text-cream/50 text-sm mt-1 line-clamp-1">{video.description}</p>}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              {videos.length === 0 && (
                <div className="col-span-3 text-center py-20 text-cream/40">
                  <Youtube size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-serif text-xl">No videos in this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
