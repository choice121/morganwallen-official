import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, GalleryPhoto } from '../lib/supabase'
import { ikUrl, ikHero, PLACEHOLDER_IMAGES } from '../lib/imagekit'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES = ['all', 'live', 'studio', 'backstage', 'fans', 'press']

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [catFilter, setCatFilter] = useState('all')
  const { user, profile } = useAuth()
  const isVip = profile?.tier === 'vip'

  useEffect(() => {
    const q = supabase.from('gallery_photos').select('*').eq('is_published', true).order('sort_order')
    if (catFilter !== 'all') q.eq('category', catFilter)
    q.then(({ data }) => {
      if (data) setPhotos(data as GalleryPhoto[])
      setLoading(false)
    })
  }, [catFilter])

  const openablePhotos = photos.filter(p => !p.is_vip_only || isVip)

  function prev() {
    if (lightbox === null) return
    const current = openablePhotos[lightbox]
    const idx = photos.findIndex(p => p.id === current?.id)
    const prevPublic = photos.slice(0, idx).reverse().find(p => !p.is_vip_only || isVip)
    if (prevPublic) setLightbox(openablePhotos.findIndex(p => p.id === prevPublic.id))
  }

  function next() {
    if (lightbox === null) return
    const current = openablePhotos[lightbox]
    const idx = photos.findIndex(p => p.id === current?.id)
    const nextPublic = photos.slice(idx + 1).find(p => !p.is_vip_only || isVip)
    if (nextPublic) setLightbox(openablePhotos.findIndex(p => p.id === nextPublic.id))
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightbox === null) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, photos.length])

  function handlePhotoClick(photo: GalleryPhoto, i: number) {
    if (photo.is_vip_only && !isVip) return
    const openableIdx = openablePhotos.findIndex(p => p.id === photo.id)
    setLightbox(openableIdx)
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-24">
      <div className="py-20 px-4 bg-dark-800">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
          <div>
            <p className="section-subtitle mb-4">Behind the Lens</p>
            <h1 className="section-title">Gallery</h1>
          </div>
          {!isVip && (
            <Link to="/join" className="hidden md:flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 transition-colors px-4 py-2 rounded-full mb-2">
              <Crown size={13} className="text-gold-400" fill="currentColor" />
              <span className="text-gold-400 font-display text-xs uppercase tracking-widest">Unlock VIP Photos</span>
            </Link>
          )}
        </div>
      </div>

      <div className="section-padding">
        <div className="container-xl">
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-4 py-2 text-xs font-display uppercase tracking-widest rounded-sm transition-all ${
                  catFilter === cat ? 'bg-gold-500 text-dark-900' : 'border border-gold-500/20 text-cream/50 hover:border-gold-500/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(photos.length ? photos : Array(8).fill(null)).map((photo, i) => {
                const locked = photo?.is_vip_only && !isVip
                return (
                  <motion.div
                    key={photo?.id ?? i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => photo && handlePhotoClick(photo, i)}
                    className={`group relative overflow-hidden rounded-sm ${i % 7 === 0 ? 'col-span-2 row-span-2' : ''} ${locked ? 'cursor-default' : 'cursor-pointer'}`}
                    style={{ aspectRatio: i % 7 === 0 ? '1/1' : '4/3' }}
                  >
                    <img
                      src={photo ? ikUrl(photo.imagekit_path) : PLACEHOLDER_IMAGES.gallery}
                      alt={photo?.title ?? ''}
                      className={`w-full h-full object-cover transition-transform duration-700 ${locked ? 'blur-sm scale-110' : 'group-hover:scale-110'}`}
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.gallery }}
                    />

                    {/* Normal hover overlay */}
                    {!locked && (
                      <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/40 transition-colors duration-300 flex items-end p-3">
                        {photo?.title && (
                          <p className="text-cream text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">{photo.title}</p>
                        )}
                      </div>
                    )}

                    {/* VIP badge on VIP content visible to VIP members */}
                    {photo?.is_vip_only && isVip && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-dark-900/80 border border-gold-500/50 text-gold-400 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 flex items-center gap-1 rounded">
                          <Crown size={8} fill="currentColor" /> VIP
                        </span>
                      </div>
                    )}

                    {/* VIP lock overlay for non-members */}
                    {locked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/65 backdrop-blur-[2px]">
                        <div className="text-center px-3">
                          <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-2">
                            <Crown size={16} className="text-gold-400" fill="currentColor" />
                          </div>
                          <p className="text-gold-400 font-display text-[10px] uppercase tracking-widest mb-2">VIP Only</p>
                          <Link
                            to="/join"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 bg-gold-500 hover:bg-gold-400 text-dark-900 font-display text-[10px] uppercase tracking-widest px-3 py-1.5 transition-colors"
                          >
                            <Crown size={9} fill="currentColor" /> Unlock
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox — only for accessible photos */}
      <AnimatePresence>
        {lightbox !== null && openablePhotos[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark-900/95 backdrop-blur flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-700 border border-gold-500/20 flex items-center justify-center text-cream hover:text-gold-400 transition-colors z-10">
              <ChevronLeft size={20} />
            </button>
            <img
              src={ikHero(openablePhotos[lightbox].imagekit_path)}
              alt={openablePhotos[lightbox].title ?? ''}
              className="max-w-full max-h-[80vh] object-contain rounded-sm shadow-gold-lg"
              onClick={e => e.stopPropagation()}
              onError={(e) => { (e.target as HTMLImageElement).src = ikUrl(openablePhotos[lightbox!].imagekit_path) }}
            />
            {openablePhotos[lightbox].title && (
              <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/70 text-sm font-display">
                {openablePhotos[lightbox].title}
              </p>
            )}
            <button onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-700 border border-gold-500/20 flex items-center justify-center text-cream hover:text-gold-400 transition-colors z-10">
              <ChevronRight size={20} />
            </button>
            <button onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark-700 border border-gold-500/20 flex items-center justify-center text-cream hover:text-gold-400 transition-colors">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
