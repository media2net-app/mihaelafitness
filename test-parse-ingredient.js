// Test parseIngredientString logic

function parseIngredientString(ingredientString) {
  const cleaned = ingredientString.trim().replace(/\s+/g, ' ');
  
  // Check if it's an ID format first (e.g., "id|name" or "1 id|name")
  if (cleaned.includes('|')) {
    const parts = cleaned.split('|');
    if (parts.length >= 2) {
      // Check if the first part contains a quantity (e.g., "1 cmgbfexoi01be8igvuow7a57d")
      const firstPart = parts[0].trim();
      const quantityMatch = firstPart.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
      
      if (quantityMatch) {
        const quantity = parseFloat(quantityMatch[1]);
        const ingredientId = quantityMatch[2];
        const ingredientName = parts.slice(1).join('|').trim();
        
        // Check if the quantity part contains a unit (g, ml, etc.)
        const unitMatch = firstPart.match(/(\d+(?:\.\d+)?)\s*(g|ml|gram|grams|milliliter|milliliters)\s+(.+)$/i);
        if (unitMatch) {
          const unit = unitMatch[2].toLowerCase() === 'g' || unitMatch[2].toLowerCase() === 'gram' || unitMatch[2].toLowerCase() === 'grams' ? 'g' : 'ml';
          return {
            name: `${ingredientId}|${ingredientName}`,
            amount: quantity,
            unit: unit,
            pieces: 1
          };
        } else {
          // Check if the ingredient name contains slice/piece indicators
          const nameLower = ingredientName.toLowerCase();
          if (nameLower.includes('slice') || nameLower.includes('piece') || nameLower.includes('stuk') || nameLower.includes('1 ')) {
            // Piece-based ingredient
            return {
              name: `${ingredientId}|${ingredientName}`,
              amount: quantity * 50, // Convert to grams for piece-based items
              unit: 'piece',
              pieces: quantity
            };
          } else {
            // Gram-based ingredient
            return {
              name: `${ingredientId}|${ingredientName}`,
              amount: quantity,
              unit: 'g',
              pieces: 1
            };
          }
        }
      }
    }
  }
  
  return null;
}

// Test cases from the logs
const testCases = [
  '2 cmgbfewgp01b78igv3zsoydrf|1 Egg',
  '38 cmgbf5hwz016c8igv0rqomyyz|Avocado',
  '1 cmgbfeyyn01bl8igvuzmjc8ut|1 Slice Whole Wheat Bread',
  '50 cmgbf5ktt017a8igvd05un12c|Cottage Cheese',
  '100 cmgbf5i8q016g8igv11v4u9e7|Tomato',
  '100 cmgbf5i3r016e8igvfc3sfn5n|Spinach'
];

console.log('Testing parseIngredientString:\n');
testCases.forEach(test => {
  const result = parseIngredientString(test);
  console.log(`Input:  "${test}"`);
  console.log(`Output:`, JSON.stringify(result, null, 2));
  console.log('---');
});

