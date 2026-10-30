import { supabase, Album, Track, TourDate, MerchItem, NewsPost, Video, GalleryPhoto } from './supabase'
import { MOCK_ALBUMS, MOCK_TRACKS, MOCK_TOUR_DATES, MOCK_MERCH, MOCK_NEWS, MOCK_VIDEOS, MOCK_GALLERY } from './mockData'

export async function getAlbums(): Promise<Album[]> {
  try {
    const { data, error } = await supabase.from('albums').select('*').order('release_date', { ascending: false })
    if (!error && data && data.length > 0) return data as Album[]
  } catch (e) {
    // fallback
  }
  return MOCK_ALBUMS
}

export async function getAlbumTracks(albumId: string): Promise<Track[]> {
  try {
    const { data, error } = await supabase.from('tracks').select('*').eq('album_id', albumId).order('track_number', { ascending: true })
    if (!error && data && data.length > 0) return data as Track[]
  } catch (e) {
    // fallback
  }
  return MOCK_TRACKS.filter(t => t.album_id === albumId)
}

export async function getTourDates(onlyUpcoming = false): Promise<TourDate[]> {
  try {
    let query = supabase.from('tour_dates').select('*').order('event_date', { ascending: true })
    if (onlyUpcoming) {
      query = query.gte('event_date', new Date().toISOString().split('T')[0])
    }
    const { data, error } = await query
    if (!error && data && data.length > 0) return data as TourDate[]
  } catch (e) {
    // fallback
  }
  if (onlyUpcoming) {
    const today = new Date().toISOString().split('T')[0]
    return MOCK_TOUR_DATES.filter(d => d.event_date >= today)
  }
  return MOCK_TOUR_DATES
}

export async function getTourDateById(id: string): Promise<TourDate | null> {
  try {
    const { data, error } = await supabase.from('tour_dates').select('*').eq('id', id).single()
    if (!error && data) return data as TourDate
  } catch (e) {
    // fallback
  }
  return MOCK_TOUR_DATES.find(d => d.id === id) || null
}

export async function getMerch(): Promise<MerchItem[]> {
  try {
    const { data, error } = await supabase.from('merch_items').select('*').order('created_at', { ascending: false })
    if (!error && data && data.length > 0) return data as MerchItem[]
  } catch (e) {
    // fallback
  }
  return MOCK_MERCH
}

export async function getNews(): Promise<NewsPost[]> {
  try {
    const { data, error } = await supabase.from('news_posts').select('*').order('published_at', { ascending: false })
    if (!error && data && data.length > 0) return data as NewsPost[]
  } catch (e) {
    // fallback
  }
  return MOCK_NEWS
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  try {
    const { data, error } = await supabase.from('news_posts').select('*').eq('slug', slug).single()
    if (!error && data) return data as NewsPost
  } catch (e) {
    // fallback
  }
  return MOCK_NEWS.find(n => n.slug === slug) || null
}

export async function getVideos(): Promise<Video[]> {
  try {
    const { data, error } = await supabase.from('videos').select('*').order('published_at', { ascending: false })
    if (!error && data && data.length > 0) return data as Video[]
  } catch (e) {
    // fallback
  }
  return MOCK_VIDEOS
}

export async function getGallery(): Promise<GalleryPhoto[]> {
  try {
    const { data, error } = await supabase.from('gallery_photos').select('*').order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) return data as GalleryPhoto[]
  } catch (e) {
    // fallback
  }
  return MOCK_GALLERY
}
