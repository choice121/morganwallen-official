import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, ExternalLink } from 'lucide-react'
import { MerchItem } from '../lib/supabase'
import { getMerch } from '../lib/dataService'
import { ikUrl, PLACEHOLDER_IMAGES } from '../lib/imagekit'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function MerchPage() {
  const [items, setItems] = useState<MerchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    getMerch().then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))] as string[]
  const filtered = category === 'all' ? items : items.filter(i => i.category === category)

  return (
    <div className="min-h-screen bg-dark-800 pt-24">
      <div className="relative py-20 px-4 bg-dark-900 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="section-subtitle mb-4">Official Store</p>
          <h1 className="section-title">Merchandise</h1>
          <p className="mt-4 text-cream/50 max-w-xl">
            Official Morgan Wallen apparel, tour merchandise, headwear, vinyl, and collectibles.
          </p>
        </div>
      </div>

      <div className="section-padding">
        <div className="container-xl">
          {/* Categories */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 text-xs font-display uppercase tracking-widest rounded-sm whitespace-nowrap transition-all ${
                  category === cat ? 'bg-gold-500 text-dark-900 font-bold' : 'border border-gold-500/30 text-cream/50 hover:border-gold-500/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-dark-700 rounded-sm overflow-hidden card-hover flex flex-col"
                >
                  <div className="aspect-square relative overflow-hidden bg-dark-600">
                    <img
                      src={item.image ? ikUrl(item.image) : PLACEHOLDER_IMAGES.merch}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.merch }}
                    />
                    {item.category && (
                      <span className="absolute top-3 left-3 bg-dark-900/80 text-cream/70 text-xs font-display uppercase tracking-widest px-2.5 py-1">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-cream group-hover:text-gold-400 transition-colors">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-cream/50 text-xs line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gold-500/10 flex items-center justify-between">
                      <span className="text-gold-400 font-display font-bold text-lg">${item.price}</span>
                      <a
                        href={item.shop_url || 'https://shop.morganwallen.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-gold py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5"
                      >
                        <ShoppingBag size={12} />
                        Buy Now
                      </a>
                    </div>
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
