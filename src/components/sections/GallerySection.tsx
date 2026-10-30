import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { GalleryPhoto } from '../../lib/supabase'
import { getGallery } from '../../lib/dataService'
import { ikUrl, PLACEHOLDER_IMAGES } from '../../lib/imagekit'
import SectionHeader from '../ui/SectionHeader'

export default function GallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])

  useEffect(() => {
    getGallery().then((data) => {
      setPhotos(data.slice(0, 5))
    })
  }, [])

  return (
    <section className="section-padding bg-dark-900">
      <div className="container-xl">
        <SectionHeader subtitle="Photos" title="Gallery" description="Live on stage, backstage, and in the studio." />

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-sm bg-dark-800 ${
                i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'
              }`}
            >
              <img
                src={photo.imagekit_path ? ikUrl(photo.imagekit_path) : PLACEHOLDER_IMAGES.gallery}
                alt={photo.title || 'Morgan Wallen Live'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.gallery }}
              />
              <div className="absolute inset-0 bg-dark-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-cream font-serif text-sm font-semibold">{photo.title || 'Live Performance'}</p>
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
          <Link to="/gallery" className="btn-outline inline-flex items-center gap-2">
            <Camera size={15} />
            View Full Gallery
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
