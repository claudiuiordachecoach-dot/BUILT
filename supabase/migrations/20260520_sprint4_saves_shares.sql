-- Sprint 4: saves & shares real columns
ALTER TABLE instagram_media
  ADD COLUMN IF NOT EXISTS saves  integer,
  ADD COLUMN IF NOT EXISTS shares integer;
