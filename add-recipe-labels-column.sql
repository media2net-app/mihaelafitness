-- Add labels column to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';

-- Update existing wrap recipes with labels
UPDATE recipes 
SET labels = ARRAY['lunch', 'dinner']
WHERE name IN ('Chicken & Avocado Wrap #1', 'Turkey & Sweet Potato Wrap', 'Beef & Veggie Wrap', 'Pork Wrap');

UPDATE recipes 
SET labels = ARRAY['breakfast']
WHERE name = 'Breakfast Egg Wrap';






