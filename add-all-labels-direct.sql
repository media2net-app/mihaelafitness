-- ============================================
-- Add labels to ALL recipes in Supabase
-- ============================================
-- Run this directly in Supabase SQL Editor
-- ============================================

-- Step 1: Ensure labels column exists (if not already run)
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';

-- Step 2: Set ALL recipes to lunch and dinner by default
UPDATE recipes 
SET labels = ARRAY['lunch', 'dinner']
WHERE labels IS NULL 
   OR array_length(labels, 1) IS NULL 
   OR array_length(labels, 1) = 0;

-- Step 3: Update breakfast recipes specifically
UPDATE recipes 
SET labels = ARRAY['breakfast']
WHERE name ILIKE '%breakfast egg wrap%'
   OR name ILIKE '%breakfast%';

-- Step 4: Verify - Show summary
SELECT 
  COUNT(*) FILTER (WHERE labels @> ARRAY['breakfast']) as breakfast_count,
  COUNT(*) FILTER (WHERE labels @> ARRAY['lunch']) as lunch_count,
  COUNT(*) FILTER (WHERE labels @> ARRAY['dinner']) as dinner_count,
  COUNT(*) as total_recipes
FROM recipes;

-- Step 5: Show sample of recipes with labels
SELECT name, labels 
FROM recipes 
ORDER BY name 
LIMIT 10;

