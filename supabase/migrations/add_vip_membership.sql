-- ============================================================
-- VIP Membership Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add tier, member_number, and vip_since to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'fan' CHECK (tier IN ('fan', 'vip')),
  ADD COLUMN IF NOT EXISTS member_number BIGINT,
  ADD COLUMN IF NOT EXISTS vip_since TIMESTAMPTZ;

-- 2. Create a sequence for member numbers (starts at 1)
CREATE SEQUENCE IF NOT EXISTS member_number_seq START 1;

-- 3. Auto-assign member_number on new profile creation
CREATE OR REPLACE FUNCTION assign_member_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_number IS NULL THEN
    NEW.member_number := nextval('member_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_assign_member_number ON profiles;
CREATE TRIGGER trg_assign_member_number
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION assign_member_number();

-- 4. Backfill member numbers for existing profiles (ordered by created_at)
DO $$
DECLARE
  r RECORD;
  n BIGINT := 1;
BEGIN
  FOR r IN SELECT id FROM profiles WHERE member_number IS NULL ORDER BY created_at ASC LOOP
    UPDATE profiles SET member_number = n WHERE id = r.id;
    n := n + 1;
  END LOOP;
  -- Advance sequence past existing numbers
  PERFORM setval('member_number_seq', GREATEST(n, 1));
END;
$$;

-- 5. Add is_vip_only to news_posts
ALTER TABLE news_posts
  ADD COLUMN IF NOT EXISTS is_vip_only BOOLEAN NOT NULL DEFAULT false;

-- 6. Add is_vip_only to gallery_photos
ALTER TABLE gallery_photos
  ADD COLUMN IF NOT EXISTS is_vip_only BOOLEAN NOT NULL DEFAULT false;

-- 7. Add is_vip_only to videos
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS is_vip_only BOOLEAN NOT NULL DEFAULT false;

-- 8. Add is_vip_early_access to tour_dates
ALTER TABLE tour_dates
  ADD COLUMN IF NOT EXISTS is_vip_early_access BOOLEAN NOT NULL DEFAULT false;

-- 9. Index for fast tier lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_member_number ON profiles(member_number);

-- Done!
-- To upgrade a user to VIP manually:
--   UPDATE profiles SET tier = 'vip', vip_since = NOW() WHERE id = '<user-uuid>';
-- To downgrade:
--   UPDATE profiles SET tier = 'fan', vip_since = NULL WHERE id = '<user-uuid>';
