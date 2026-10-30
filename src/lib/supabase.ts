import { createClient, User, Session } from '@supabase/supabase-js'
import {
  MOCK_ALBUMS,
  MOCK_TRACKS,
  MOCK_TOUR_DATES,
  MOCK_MERCH,
  MOCK_NEWS,
  MOCK_VIDEOS,
  MOCK_GALLERY,
} from './mockData'

export type MemberTier = 'fan' | 'vip'

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  is_admin: boolean
  tier: MemberTier
  member_number: number | null
  vip_since: string | null
  created_at: string
  updated_at: string
}

export type Album = {
  id: string
  title: string
  slug: string
  release_date: string | null
  cover_image: string | null
  description: string | null
  spotify_url: string | null
  apple_music_url: string | null
  youtube_url: string | null
  is_published: boolean
  created_at: string
}

export type Track = {
  id: string
  album_id: string | null
  title: string
  track_number: number | null
  duration_seconds: number | null
  spotify_url: string | null
  apple_music_url: string | null
  youtube_url: string | null
  is_published: boolean
  created_at: string
}

export type TourDate = {
  id: string
  event_date: string
  event_time: string | null
  city: string
  state: string | null
  country: string
  venue: string
  ticket_url: string | null
  is_sold_out: boolean
  is_cancelled: boolean
  is_vip_early_access: boolean
  created_at: string
}

export type NewsPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string
  is_published: boolean
  is_vip_only: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type MerchItem = {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: string | null
  shop_url: string | null
  is_available: boolean
  is_featured: boolean
  created_at: string
}

export type GalleryPhoto = {
  id: string
  title: string | null
  imagekit_path: string
  category: string
  taken_at: string | null
  is_published: boolean
  is_vip_only: boolean
  sort_order: number
  created_at: string
}

export type Video = {
  id: string
  title: string
  description: string | null
  imagekit_path: string | null
  youtube_url: string | null
  thumbnail: string | null
  category: string
  duration_seconds: number | null
  is_published: boolean
  is_vip_only: boolean
  published_at: string
  created_at: string
}

export type NewsletterSubscriber = {
  id: string
  email: string
  first_name: string | null
  is_confirmed: boolean
  confirmation_token: string | null
  confirmed_at: string | null
  subscribed_at: string
}

export type ContactSubmission = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  inquiry_type: string
  is_read: boolean
  created_at: string
}

export type TicketOrder = {
  id: string
  order_number: string
  tour_date_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  ticket_type: string
  quantity: number
  unit_price: number
  total_price: number
  status: string
  user_id: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile }
      albums: { Row: Album }
      tracks: { Row: Track }
      tour_dates: { Row: TourDate }
      news_posts: { Row: NewsPost }
      merch_items: { Row: MerchItem }
      gallery_photos: { Row: GalleryPhoto }
      videos: { Row: Video }
      newsletter_subscribers: { Row: NewsletterSubscriber }
      contact_submissions: { Row: ContactSubmission }
      ticket_orders: { Row: TicketOrder }
    }
  }
}

// ---------------------------------------------------------
// Seed fallback datasets for interactive demo mode
// ---------------------------------------------------------
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-admin',
    username: 'morgan_admin',
    full_name: 'Morgan Wallen Admin',
    avatar_url: 'https://ik.imagekit.io/Morganwallen/photos/microphone_gxXBS-LVN.jpg',
    bio: 'Official Morgan Wallen management and administrator.',
    is_admin: true,
    tier: 'vip',
    member_number: 1,
    vip_since: '2020-01-01T00:00:00Z',
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-vip-1042',
    username: 'tennessee_fan',
    full_name: 'Cole Swindell',
    avatar_url: null,
    bio: 'Proud VIP fan since Dangerous.',
    is_admin: false,
    tier: 'vip',
    member_number: 1042,
    vip_since: '2024-01-15T00:00:00Z',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
]

const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-1',
    email: 'fanclub@morganwallen.com',
    first_name: 'Colton',
    is_confirmed: true,
    confirmation_token: null,
    confirmed_at: '2024-02-14T10:00:00Z',
    subscribed_at: '2024-02-14T09:30:00Z',
  },
  {
    id: 'sub-2',
    email: 'ashley.tennessee@gmail.com',
    first_name: 'Ashley',
    is_confirmed: true,
    confirmation_token: null,
    confirmed_at: '2024-03-01T12:00:00Z',
    subscribed_at: '2024-03-01T11:45:00Z',
  },
  {
    id: 'sub-3',
    email: 'knoxville_country@yahoo.com',
    first_name: 'Tyler',
    is_confirmed: true,
    confirmation_token: null,
    confirmed_at: '2024-04-10T15:20:00Z',
    subscribed_at: '2024-04-10T15:00:00Z',
  },
]

const INITIAL_CONTACTS: ContactSubmission[] = [
  {
    id: 'cs-1',
    name: 'Jake Miller',
    email: 'jake@nashvilletimes.com',
    subject: 'Tour Coverage & Press Access',
    message: 'Hello, inquiring about credentials for the upcoming Nashville stadium tour stop.',
    inquiry_type: 'press',
    is_read: false,
    created_at: '2025-05-18T14:30:00Z',
  },
  {
    id: 'cs-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@gmail.com',
    subject: 'VIP Fan Club Question',
    message: 'Loving the new music! Will there be early entry lines in Atlanta?',
    inquiry_type: 'fan-mail',
    is_read: true,
    created_at: '2025-05-19T09:15:00Z',
  },
]

const INITIAL_ORDERS: TicketOrder[] = [
  {
    id: 'ord-1001',
    order_number: 'MW-482910',
    tour_date_id: 'td-1',
    customer_name: 'Travis Scott',
    customer_email: 'travis.fan@gmail.com',
    customer_phone: '615-555-0199',
    ticket_type: 'floor',
    quantity: 2,
    unit_price: 149,
    total_price: 298,
    status: 'confirmed',
    user_id: 'user-admin',
    admin_notes: 'VIP floor wristbands verified',
    created_at: '2025-05-15T18:20:00Z',
    updated_at: '2025-05-15T18:25:00Z',
  },
  {
    id: 'ord-1002',
    order_number: 'MW-918234',
    tour_date_id: 'td-2',
    customer_name: 'Jessica Vance',
    customer_email: 'jess.vance@icloud.com',
    customer_phone: '404-555-0144',
    ticket_type: 'vip_experience',
    quantity: 2,
    unit_price: 299,
    total_price: 598,
    status: 'reserved',
    user_id: null,
    admin_notes: null,
    created_at: '2025-05-18T11:05:00Z',
    updated_at: '2025-05-18T11:05:00Z',
  },
]

// ---------------------------------------------------------
// Local storage helper
// ---------------------------------------------------------
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {}
}

// ---------------------------------------------------------
// Mock Data Tables Store
// ---------------------------------------------------------
function getTableData(table: string): any[] {
  switch (table) {
    case 'albums':
      return getStored('mw_mock_albums', MOCK_ALBUMS)
    case 'tracks':
      return getStored('mw_mock_tracks', MOCK_TRACKS)
    case 'tour_dates':
      return getStored('mw_mock_tour_dates', MOCK_TOUR_DATES)
    case 'news_posts':
      return getStored('mw_mock_news', MOCK_NEWS)
    case 'merch_items':
      return getStored('mw_mock_merch', MOCK_MERCH)
    case 'gallery_photos':
      return getStored('mw_mock_gallery', MOCK_GALLERY)
    case 'videos':
      return getStored('mw_mock_videos', MOCK_VIDEOS)
    case 'newsletter_subscribers':
      return getStored('mw_newsletter_subscribers', INITIAL_SUBSCRIBERS)
    case 'contact_submissions':
      return getStored('mw_contact_submissions', INITIAL_CONTACTS)
    case 'ticket_orders':
      return getStored('mw_ticket_orders', INITIAL_ORDERS)
    case 'profiles':
      return getStored('mw_profiles', INITIAL_PROFILES)
    default:
      return getStored(`mw_table_${table}`, [])
  }
}

function saveTableData(table: string, data: any[]): void {
  switch (table) {
    case 'albums':
      setStored('mw_mock_albums', data); break
    case 'tracks':
      setStored('mw_mock_tracks', data); break
    case 'tour_dates':
      setStored('mw_mock_tour_dates', data); break
    case 'news_posts':
      setStored('mw_mock_news', data); break
    case 'merch_items':
      setStored('mw_mock_merch', data); break
    case 'gallery_photos':
      setStored('mw_mock_gallery', data); break
    case 'videos':
      setStored('mw_mock_videos', data); break
    case 'newsletter_subscribers':
      setStored('mw_newsletter_subscribers', data); break
    case 'contact_submissions':
      setStored('mw_contact_submissions', data); break
    case 'ticket_orders':
      setStored('mw_ticket_orders', data); break
    case 'profiles':
      setStored('mw_profiles', data); break
    default:
      setStored(`mw_table_${table}`, data); break
  }
}

// ---------------------------------------------------------
// Mock Query Builder
// ---------------------------------------------------------
class MockQueryBuilder {
  private table: string
  private filters: Array<(row: any) => boolean> = []
  private sortFn: ((a: any, b: any) => number) | null = null
  private limitCount: number | null = null
  private isSingle = false
  private countMode: string | null = null
  private isHead = false
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private payload: any = null

  constructor(table: string) {
    this.table = table
  }

  select(columns = '*', options?: { count?: string; head?: boolean }) {
    this.operation = 'select'
    if (options?.count) this.countMode = options.count
    if (options?.head) this.isHead = true
    return this
  }

  eq(column: string, value: any) {
    this.filters.push(row => String(row[column]) === String(value))
    return this
  }

  gte(column: string, value: any) {
    this.filters.push(row => row[column] >= value)
    return this
  }

  lte(column: string, value: any) {
    this.filters.push(row => row[column] <= value)
    return this
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    const ascending = options?.ascending !== false
    this.sortFn = (a, b) => {
      const valA = a[column]
      const valB = b[column]
      if (valA == null && valB == null) return 0
      if (valA == null) return ascending ? 1 : -1
      if (valB == null) return ascending ? -1 : 1
      if (valA < valB) return ascending ? -1 : 1
      if (valA > valB) return ascending ? 1 : -1
      return 0
    }
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  insert(values: any) {
    this.operation = 'insert'
    this.payload = values
    return this
  }

  update(values: any) {
    this.operation = 'update'
    this.payload = values
    return this
  }

  delete() {
    this.operation = 'delete'
    return this
  }

  async execute(): Promise<{ data: any; error: any; count?: number }> {
    let rows = [...getTableData(this.table)]

    if (this.operation === 'insert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload]
      const inserted = items.map(item => ({
        id: item.id || `${this.table.slice(0, 3)}-${Math.random().toString(36).substring(2, 9)}`,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...item,
      }))
      rows = [...inserted, ...rows]
      saveTableData(this.table, rows)
      return {
        data: this.isSingle ? inserted[0] : (Array.isArray(this.payload) ? inserted : inserted[0]),
        error: null,
      }
    }

    if (this.operation === 'update') {
      let updatedRows: any[] = []
      rows = rows.map(r => {
        const matches = this.filters.length === 0 || this.filters.every(f => f(r))
        if (matches) {
          const updated = { ...r, ...this.payload, updated_at: new Date().toISOString() }
          updatedRows.push(updated)
          return updated
        }
        return r
      })
      saveTableData(this.table, rows)
      return {
        data: this.isSingle ? (updatedRows[0] ?? null) : updatedRows,
        error: null,
      }
    }

    if (this.operation === 'delete') {
      const remaining = rows.filter(r => !this.filters.every(f => f(r)))
      saveTableData(this.table, remaining)
      return { data: null, error: null }
    }

    // Operation: SELECT
    let filtered = rows
    for (const filter of this.filters) {
      filtered = filtered.filter(filter)
    }

    const exactCount = filtered.length

    if (this.sortFn) {
      filtered = [...filtered].sort(this.sortFn)
    }

    if (this.limitCount != null) {
      filtered = filtered.slice(0, this.limitCount)
    }

    if (this.isHead) {
      return { data: null, count: exactCount, error: null }
    }

    if (this.isSingle) {
      const item = filtered[0] ?? null
      return {
        data: item,
        count: item ? 1 : 0,
        error: item ? null : { message: 'Row not found', code: 'PGRST116' },
      }
    }

    return {
      data: filtered,
      count: exactCount,
      error: null,
    }
  }

  // Make the builder thenable so `await supabase.from(...)` works smoothly
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

// ---------------------------------------------------------
// Mock Auth Provider
// ---------------------------------------------------------
type AuthStateListener = (event: string, session: Session | null) => void
const authListeners = new Set<AuthStateListener>()

function getMockSession(): Session | null {
  const stored = getStored<Session | null>('mw_auth_session', null)
  return stored
}

function setMockSession(session: Session | null): void {
  setStored('mw_auth_session', session)
  const event = session ? 'SIGNED_IN' : 'SIGNED_OUT'
  authListeners.forEach(cb => {
    try {
      cb(event, session)
    } catch (err) {
      console.warn('[auth listener error]', err)
    }
  })
}

function makeMockUser(email: string, fullName = '', isAdmin = false): User {
  return {
    id: isAdmin ? 'user-admin' : `user-${Math.random().toString(36).substring(2, 9)}`,
    email,
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: fullName },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User
}

const mockAuth = {
  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    return { data: { session: getMockSession() }, error: null }
  },

  onAuthStateChange(callback: AuthStateListener) {
    authListeners.add(callback)
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners.delete(callback)
          },
        },
      },
    }
  },

  async signInWithPassword({ email, password }: { email: string; password?: string }) {
    const trimmedEmail = email.trim().toLowerCase()
    const isAdmin = trimmedEmail.includes('admin')
    const user = makeMockUser(trimmedEmail, isAdmin ? 'Morgan Wallen Admin' : trimmedEmail.split('@')[0], isAdmin)
    const session: Session = {
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    // Ensure profile exists in profiles table
    const profiles = getTableData('profiles')
    let profile = profiles.find((p: Profile) => p.id === user.id || p.username === trimmedEmail.split('@')[0])
    if (!profile) {
      profile = {
        id: user.id,
        username: trimmedEmail.split('@')[0],
        full_name: user.user_metadata.full_name || trimmedEmail.split('@')[0],
        avatar_url: null,
        bio: null,
        is_admin: isAdmin,
        tier: isAdmin ? 'vip' : 'fan',
        member_number: Math.floor(1000 + Math.random() * 9000),
        vip_since: isAdmin ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      profiles.unshift(profile)
      saveTableData('profiles', profiles)
    }

    setMockSession(session)
    return { data: { user, session }, error: null }
  },

  async signUp({ email, password }: { email: string; password?: string }) {
    const trimmedEmail = email.trim().toLowerCase()
    const isAdmin = trimmedEmail.includes('admin')
    const user = makeMockUser(trimmedEmail, trimmedEmail.split('@')[0], isAdmin)
    const session: Session = {
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const profiles = getTableData('profiles')
    const existingMemberCount = profiles.length
    const profile: Profile = {
      id: user.id,
      username: trimmedEmail.split('@')[0],
      full_name: trimmedEmail.split('@')[0],
      avatar_url: null,
      bio: null,
      is_admin: isAdmin,
      tier: 'fan',
      member_number: 1000 + existingMemberCount + 1,
      vip_since: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    profiles.unshift(profile)
    saveTableData('profiles', profiles)

    setMockSession(session)
    return { data: { user, session }, error: null }
  },

  async signOut() {
    setMockSession(null)
    return { error: null }
  },

  async setSession(session: Session | null) {
    setMockSession(session)
    return { data: { session }, error: null }
  },

  async signInWithOAuth({ provider, options }: { provider: string; options?: { redirectTo?: string } }) {
    const user = makeMockUser('google.fan@gmail.com', 'Google Club Member', false)
    const session: Session = {
      access_token: 'mock-google-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-google-refresh',
      user,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    const profiles = getTableData('profiles')
    if (!profiles.some((p: Profile) => p.id === user.id)) {
      profiles.unshift({
        id: user.id,
        username: 'google_member',
        full_name: 'Google Club Member',
        avatar_url: null,
        bio: 'Connected via Google.',
        is_admin: false,
        tier: 'vip',
        member_number: 1043,
        vip_since: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      saveTableData('profiles', profiles)
    }

    setMockSession(session)
    if (options?.redirectTo) {
      window.location.href = options.redirectTo
    }
    return { data: { provider, url: options?.redirectTo || null }, error: null }
  },

  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    return { data: {}, error: null }
  },
}

// ---------------------------------------------------------
// Exported Client
// ---------------------------------------------------------
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

const isRealSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 20
)

let client: any

if (isRealSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (err) {
    console.warn('[Supabase] Failed to initialize real client, falling back to mock:', err)
    client = null
  }
}

export const supabase = client || {
  from: (table: string) => new MockQueryBuilder(table),
  auth: mockAuth,
}
