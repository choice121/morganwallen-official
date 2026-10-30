import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { NewsPost } from '../lib/supabase'
import { getNewsBySlug } from '../lib/dataService'
import { ikUrl, PLACEHOLDER_IMAGES } from '../lib/imagekit'
import { format } from 'date-fns'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function NewsPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getNewsBySlug(slug).then((data) => {
      setPost(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-800 pt-32 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-dark-800 pt-32 text-center text-cream/60">
        <h2 className="text-2xl font-serif mb-4">Article Not Found</h2>
        <Link to="/news" className="btn-outline">Back to News</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-800 pt-24 pb-20">
      <article className="max-w-4xl mx-auto px-4">
        <Link to="/news" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 text-xs font-display uppercase tracking-widest mb-8">
          <ArrowLeft size={14} /> Back to News
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 text-xs font-display uppercase tracking-wider text-cream/40 mb-4">
            <span className="bg-gold-500 text-dark-900 font-bold px-2 py-0.5 rounded-sm">{post.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar size={12} />{post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'Recent'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-cream leading-tight">
            {post.title}
          </h1>
        </header>

        <div className="aspect-[16/9] rounded-sm overflow-hidden mb-10 shadow-card">
          <img
            src={post.cover_image ? ikUrl(post.cover_image) : PLACEHOLDER_IMAGES.news}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-invert max-w-none text-cream/70 text-base md:text-lg leading-relaxed space-y-6 font-sans">
          <p>{post.content}</p>
        </div>
      </article>
    </div>
  )
}
