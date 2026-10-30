import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'
import { NewsPost } from '../lib/supabase'
import { getNews } from '../lib/dataService'
import { ikUrl, PLACEHOLDER_IMAGES } from '../lib/imagekit'
import { format } from 'date-fns'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNews().then((data) => {
      setPosts(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-dark-800 pt-24">
      <div className="relative py-20 px-4 bg-dark-900 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="section-subtitle mb-4">Official Announcements</p>
          <h1 className="section-title">News & Press</h1>
          <p className="mt-4 text-cream/50 max-w-xl">
            Keep up with tour releases, award milestones, and the latest from Morgan Wallen.
          </p>
        </div>
      </div>

      <div className="section-padding">
        <div className="container-xl">
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="group bg-dark-700 rounded-sm overflow-hidden card-hover flex flex-col"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-dark-600">
                    <img
                      src={post.cover_image ? ikUrl(post.cover_image) : PLACEHOLDER_IMAGES.news}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.news }}
                    />
                    <span className="absolute top-3 left-3 bg-gold-500 text-dark-900 text-xs font-display font-bold uppercase tracking-widest px-2.5 py-1">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-cream/40 text-xs font-display uppercase tracking-wider mb-2">
                        <Calendar size={12} />
                        <span>{post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'Recent'}</span>
                      </div>
                      <h2 className="font-serif text-xl font-semibold text-cream group-hover:text-gold-400 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-3 text-cream/60 text-sm line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gold-500/10">
                      <Link
                        to={`/news/${post.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        Read Full Story <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
