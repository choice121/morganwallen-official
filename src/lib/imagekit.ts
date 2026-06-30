const IK_URL = import.meta.env.VITE_IMAGEKIT_URL || 'https://ik.imagekit.io/Morganwallen'

export function ikUrl(path: string, transforms?: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = IK_URL.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  if (transforms) {
    return `${base}/tr:${transforms}/${cleanPath}`
  }
  return `${base}/${cleanPath}`
}

export function ikThumb(path: string, w = 400, h = 300): string {
  return ikUrl(path, `w-${w},h-${h},fo-auto,q-80`)
}

export function ikHero(path: string): string {
  return ikUrl(path, 'w-1920,h-1080,fo-auto,q-85')
}

export function ikSquare(path: string, size = 600): string {
  return ikUrl(path, `w-${size},h-${size},c-maintain_ratio,fo-auto,q-80`)
}

export function ikCard(path: string): string {
  return ikUrl(path, 'w-800,h-600,fo-auto,q-80')
}

// Real images from ImageKit — used as fallbacks when Supabase data has no image
export const PLACEHOLDER_IMAGES = {
  // Dangerous album cover (most iconic) — stored in /albums/
  album: ikSquare('/albums/dangerous-album_bMMbSSaOJ.jpg', 600),
  // Press photo from official site crawl
  hero: ikHero('/gallery/press/gallery-press-press-001.jpg'),
  // Second press photo
  news: ikCard('/gallery/press/gallery-press-press-002.jpg'),
  // Concert stage photo
  merch: ikSquare('/photos/concert-stage_-8J_E290B.jpg', 600),
  // Live performance thumbnail
  gallery: ikCard('/gallery/live/gallery-yt-mgukVsbihaQ.jpg'),
  // Music video thumbnail
  video: ikCard('/gallery/live/gallery-yt-pCv0oP9JLKw.jpg'),
  // Generic concert crowd for avatar fallback
  avatar: ikSquare('/photos/microphone_gxXBS-LVN.jpg', 200),
}
