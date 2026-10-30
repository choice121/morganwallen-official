import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import { NewsPost } from '../../lib/supabase'
import { getNews } from '../../lib/dataService'
import { ikUrl, PLACEHOLDER_IMAGES } from '../../lib/imagekit'
import { format } from 'date-fns'
import SectionHeader from '../ui/SectionHeader'

export default function NewsSection() {
  const [posts, setPosts] = useState<NewsPost[]>([])

  useEffect(() => {
    getNews().then((data) => {
      setPosts(data.slice(0, 3))
    })
  }, [])

  return (
    <section className="section-padding bg-dark-700">
      <div className="container-xl">
        <SectionHeader subtitle="Latest Updates" title="News & Press" description="The latest announcements, tour news, and milestones from Morgan Wallen." />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group bg-dark-800 rounded-sm overflow-hidden card-hover flex flex-col"
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
                  <h3 className="font-serif text-xl font-semibold text-cream group-hover:text-gold-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link to="/news" className="btn-outline">
            View All News
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
