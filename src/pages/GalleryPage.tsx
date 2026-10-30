import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GalleryPhoto } from '../lib/supabase'
import { getGallery } from '../lib/dataService'
import { ikUrl, PLACEHOLDER_IMAGES } from '../lib/imagekit'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)

  useEffect(() => {
    getGallery().then((data) => {
      setPhotos(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-dark-800 pt-24">
      <div className="relative py-20 px-4 bg-dark-900 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="section-subtitle mb-4">Visual Archive</p>
          <h1 className="section-title">Photo Gallery</h1>
          <p className="mt-4 text-cream/50 max-w-xl">
            Tour photography, candid studio moments, and stage highlights.
          </p>
        </div>
      </div>

      <div className="section-padding">
        <div className="container-xl">
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-dark-700 cursor-pointer card-hover"
                >
                  <img
                    src={photo.imagekit_path ? ikUrl(photo.imagekit_path) : PLACEHOLDER_IMAGES.gallery}
                    alt={photo.title || 'Morgan Wallen'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.gallery }}
                  />
                  <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <span className="text-gold-400 text-xs font-display uppercase tracking-widest mb-1">{photo.category}</span>
                    <h3 className="font-serif text-cream font-semibold text-base">{photo.title || 'Concert Highlight'}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.imagekit_path ? ikUrl(selectedPhoto.imagekit_path) : PLACEHOLDER_IMAGES.gallery}
              alt=""
              className="max-h-[80vh] w-auto mx-auto rounded-sm shadow-2xl"
            />
            <p className="text-center text-cream/70 text-sm mt-3 font-serif">{selectedPhoto.title}</p>
          </div>
        </div>
      )}
    </div>
  )
}
