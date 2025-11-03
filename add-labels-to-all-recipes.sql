-- ============================================
-- Add labels to all recipes in the database
-- ============================================
-- This script will:
-- 1. Ensure the labels column exists
-- 2. Set all recipes to have 'lunch' and 'dinner' labels by default
-- 3. Set breakfast recipes to have 'breakfast' label only
-- ============================================

-- Step 1: Ensure labels column exists (if not already run)
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';

-- Step 2: Set all recipes to lunch and dinner by default
UPDATE recipes 
SET labels = ARRAY['lunch', 'dinner']
WHERE labels IS NULL OR array_length(labels, 1) IS NULL;

-- Step 3: Update breakfast recipes
UPDATE recipes 
SET labels = ARRAY['breakfast']
WHERE name ILIKE '%breakfast%' 
   OR name ILIKE '%Breakfast Egg Wrap%';

-- Step 4: Verify - Show statistics
-- (Uncomment to run verification)
-- SELECT 
--   COUNT(*) FILTER (WHERE labels @> ARRAY['breakfast']) as breakfast_count,
--   COUNT(*) FILTER (WHERE labels @> ARRAY['lunch']) as lunch_count,
--   COUNT(*) FILTER (WHERE labels @> ARRAY['dinner']) as dinner_count,
--   COUNT(*) as total_recipes
-- FROM recipes;

-- Step 5: Show sample of updated recipes (uncomment to see)
-- SELECT name, labels FROM recipes ORDER BY name;
