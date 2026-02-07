-- Add GIN indexes for full-text search on items
-- This allows efficient searching by title and description
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_items_title_trgm ON public.items USING gin (title gin_trgm_ops);
CREATE INDEX idx_items_description_trgm ON public.items USING gin (description gin_trgm_ops);

-- Add composite indexes for common filtering patterns
-- Optimizes: Filter by category + Sort by price/date
CREATE INDEX idx_items_category_price ON public.items (category, price);
CREATE INDEX idx_items_category_created_at ON public.items (category, created_at DESC);

-- Optimizes: Filter by active status + Sort by date (Feed view)
CREATE INDEX idx_items_active_created_at ON public.items (is_active, created_at DESC);
