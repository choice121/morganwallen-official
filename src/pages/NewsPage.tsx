import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Crown, Lock } from 'lucide-react'
import { supabase, NewsPost } from '../lib/supabase'
import { ikUrl, PLACEHOLDER_IMAGES } from '../lib/imagekit'
import { format } from 'date-fns'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES = ['all', 'news', 'music', 'tour', 'video']

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const { user, profile } = useAuth()
  const isVip = profile?.tier === 'vip'

  useEffect(() => {
    const query = supabase
      .from('news_posts')
      .select('*')
      .eq('is_published', true)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
    if (category !== 'all') query.eq('category', category)
    query.then(({ data }) => {
      if (data) setPosts(data as NewsPost[])
      setLoading(false)
    })
  }, [category])

  return (
    <div className="min-h-screen bg-dark-800 pt-24">
      <div className="relative py-20 px-4 bg-dark-900">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
          <div>
            <p className="section-subtitle mb-4">Latest Updates</p>
            <h1 className="section-title">News</h1>
          </div>
          {!isVip && (
            <Link to="/join" className="hidden md:flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 transition-colors px-4 py-2 rounded-full mb-2">
              <Crown size={13} className="text-gold-400" fill="currentColor" />
              <span className="text-gold-400 font-display text-xs uppercase tracking-widest">Unlock VIP Content</span>
            </Link>
          )}
        </div>
      </div>

      <div className="section-padding">
        <div className="container-xl">
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-xs font-display uppercase tracking-widest rounded-sm transition-all ${
                  category === cat ? 'bg-gold-500 text-dark-900' : 'border border-gold-500/20 text-cream/50 hover:border-gold-500/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => {
                const locked = post.is_vip_only && !isVip
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`group bg-dark-700 rounded-sm overflow-hidden gold-border relative ${i === 0 ? 'md:col-span-2' : ''} ${locked ? '' : 'card-hover'}`}
                  >
                    {/* Image */}
                    <div className={`relative overflow-hidden ${i === 0 ? 'aspect-video' : 'aspect-[4/3]'} ${locked ? 'blur-sm scale-105' : ''} transition-all duration-300`}>
                      <img
                        src={post.cover_image ? ikUrl(post.cover_image) : PLACEHOLDER_IMAGES.news}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.news }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-gold-500/90 text-dark-900 text-xs font-display uppercase tracking-widest px-2 py-1 font-semibold">
                          {post.category}
                        </span>
                        {post.is_vip_only && (
                          <span className="bg-dark-900/80 border border-gold-500/50 text-gold-400 text-[10px] font-display uppercase tracking-widest px-2 py-1 flex items-center gap-1">
                            <Crown size={9} fill="currentColor" /> VIP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-6 ${locked ? 'blur-sm select-none' : ''}`}>
                      <p className="text-cream/40 text-xs mb-2 font-display uppercase tracking-widest">
                        {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : ''}
                      </p>
                      <h2 className={`font-serif font-bold text-cream group-hover:text-gold-400 transition-colors ${i === 0 ? 'text-2xl' : 'text-lg'}`}>
                        {post.title}
                      </h2>
                      {post.excerpt && <p className="mt-2 text-cream/50 text-sm line-clamp-2">{post.excerpt}</p>}
                      <span className="mt-4 inline-flex items-center gap-1 text-gold-400 text-xs font-display uppercase tracking-widest">
                        Read More <ArrowRight size={12} />
                      </span>
                    </div>

                    {/* VIP lock overlay */}
                    {locked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/60 backdrop-blur-[2px]">
                        <div className="text-center px-6">
                          <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-3">
                            <Crown size={20} className="text-gold-400" fill="currentColor" />
                          </div>
                          <p className="text-gold-400 font-display text-xs uppercase tracking-widest mb-1">VIP Exclusive</p>
                          <p className="text-cream/60 text-sm mb-4">
                            {user ? 'Upgrade to VIP to read this' : 'Join to unlock exclusive content'}
                          </p>
                          <Link to="/join" className="inline-flex items-center gap-2 btn-gold py-2 px-5 text-xs">
                            <Crown size={12} fill="currentColor" />
                            {user ? 'Go VIP' : 'Join Now'}
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Make the whole card clickable for unlocked posts */}
                    {!locked && (
                      <Link to={`/news/${post.slug}`} className="absolute inset-0" aria-label={post.title} />
                    )}
                  </motion.article>
                )
              })}
              {posts.length === 0 && (
                <div className="col-span-3 text-center py-20 text-cream/40">
                  <p className="font-serif text-xl">No posts in this category yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
