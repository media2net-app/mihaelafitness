-- Add nameRo column to ingredients table for Romanian translations
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS "nameRo" TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ingredients_nameRo ON ingredients("nameRo");

