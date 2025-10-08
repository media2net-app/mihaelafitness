-- Create a new table for API-sourced ingredients
-- This table will store ingredients imported from external APIs like USDA

CREATE TABLE IF NOT EXISTS api_ingredients (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL,
    api_id TEXT, -- External API ID (e.g., USDA FDC ID)
    source TEXT NOT NULL, -- API source (e.g., 'USDA', 'Edamam', 'Spoonacular')
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    fiber REAL DEFAULT 0,
    sugar REAL DEFAULT 0,
    sodium REAL DEFAULT 0,
    category TEXT,
    per TEXT DEFAULT '100g',
    aliases TEXT[], -- Array of alternative names
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_ingredients_name ON api_ingredients(name);
CREATE INDEX IF NOT EXISTS idx_api_ingredients_source ON api_ingredients(source);
CREATE INDEX IF NOT EXISTS idx_api_ingredients_category ON api_ingredients(category);
CREATE INDEX IF NOT EXISTS idx_api_ingredients_api_id ON api_ingredients(api_id);

-- Create a view to combine both ingredient tables
CREATE VIEW IF NOT EXISTS all_ingredients AS
SELECT 
    id,
    name,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    category,
    per,
    aliases,
    is_active,
    created_at,
    updated_at,
    'database' as source
FROM ingredients
UNION ALL
SELECT 
    id,
    name,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    category,
    per,
    aliases,
    is_active,
    created_at,
    updated_at,
    source
FROM api_ingredients;

-- Create a function to update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_api_ingredients_updated_at 
    AFTER UPDATE ON api_ingredients
    FOR EACH ROW
BEGIN
    UPDATE api_ingredients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;




