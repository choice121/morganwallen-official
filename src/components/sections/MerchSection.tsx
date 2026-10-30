import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { MerchItem } from '../../lib/supabase'
import { getMerch } from '../../lib/dataService'
import { ikUrl, PLACEHOLDER_IMAGES } from '../../lib/imagekit'
import SectionHeader from '../ui/SectionHeader'

export default function MerchSection() {
  const [items, setItems] = useState<MerchItem[]>([])

  useEffect(() => {
    getMerch().then((data) => {
      setItems(data.slice(0, 4))
    })
  }, [])

  return (
    <section className="section-padding bg-dark-800">
      <div className="container-xl">
        <SectionHeader subtitle="Official Store" title="Merchandise" description="Exclusive Still The Problem Tour and album apparel, vinyl, and collectibles." />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-dark-700 rounded-sm overflow-hidden card-hover"
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

              <div className="p-4">
                <h3 className="font-serif text-base font-semibold text-cream group-hover:text-gold-400 transition-colors line-clamp-1">
                  {item.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gold-400 font-display font-bold text-lg">${item.price}</span>
                  <a
                    href={item.shop_url || 'https://shop.morganwallen.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cream/50 hover:text-gold-400 flex items-center gap-1 font-display uppercase tracking-wider transition-colors"
                  >
                    <ShoppingBag size={13} />
                    Buy Now
                  </a>
                </div>
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
          <Link to="/merch" className="btn-outline inline-flex items-center gap-2">
            View All Merch <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
