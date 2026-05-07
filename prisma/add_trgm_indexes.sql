-- add_trgm_indexes.sql
-- Creates pg_trgm extension and GIN trigram indexes for fast ILIKE/contains searches.
-- Run with psql (not inside a transaction) during a maintenance window if tables are large.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram GIN indexes CONCURRENTLY to avoid write locks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poemslines_content_trgm
  ON "PoemsLines" USING GIN (content gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poems_name_trgm
  ON "Poems" USING GIN (name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poems_engtopic_trgm
  ON "Poems" USING GIN ("engTopic" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poems_arabtopic_trgm
  ON "Poems" USING GIN ("arabTopic" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poems_engsea_trgm
  ON "Poems" USING GIN ("engSea" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poems_arabsea_trgm
  ON "Poems" USING GIN ("arabSea" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poems_quafia_trgm
  ON "Poems" USING GIN ("quafia" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poets_engname_trgm
  ON "Poets" USING GIN ("engName" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poets_arabname_trgm
  ON "Poets" USING GIN ("arabName" gin_trgm_ops);

-- Optional: index for poet bio (may be large)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poets_bio_trgm
  ON "Poets" USING GIN ("bio" gin_trgm_ops);

-- End of file
