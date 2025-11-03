// Script to fix all recipes to exact macros: 500 kcal, 23g protein, 12g fat, 45g carbs

const recipes = [
  {
    id: 'cmhj7rdez0015dyqvaq1lkfbp',
    name: 'Chicken & Avocado Wrap',
    type: 'wrap',
    ingredients: ['Wrap whole wheat (60 grame)', 'Chicken Breast', 'Brown Rice (cooked)', 'Avocado', 'Cheddar Cheese', 'Salad']
  },
  {
    id: 'cmhj7y1a5001idyqvs5rqejrk',
    name: 'Turkey & Sweet Potato Wrap',
    type: 'wrap',
    ingredients: ['Wrap whole wheat (60 grame)', 'Turkey Breast', 'Sweet Potato', 'Avocado', 'Cheddar Cheese', 'Salad']
  },
  {
    id: 'cmhj83u4f001vdyqvz1a5e816',
    name: 'Beef & Veggie Wrap',
    type: 'wrap',
    ingredients: ['Wrap whole wheat (60 grame)', 'Beef', 'Bell Pepper', 'Onion', 'Mushrooms', 'Tomato', 'Avocado', 'Cheddar Cheese', 'Salad']
  },
  {
    id: 'cmhj86wt3002pdyqvsekmaqh6',
    name: 'Breakfast Egg Wrap',
    type: 'wrap',
    ingredients: ['Wrap whole wheat (60 grame)', '1 Egg', 'Turkey Breast', 'Spinach', 'Mushrooms', 'Bell Pepper', 'Tomato', 'Avocado', 'Cheddar Cheese']
  },
  {
    id: 'cmhj8chf0003gdyqvig1dvdbl',
    name: 'Pork Wrap',
    type: 'wrap',
    ingredients: ['Wrap whole wheat (60 grame)', 'Pork', 'Bell Pepper', 'Onion', 'Mushrooms', 'Tomato', 'Avocado', 'Cheddar Cheese', 'Salad']
  },
  {
    id: 'cmhj8sfp6003qdyqvdjgxe6yp',
    name: 'Chicken Breast with Rice and Vegetables',
    type: 'meal',
    ingredients: ['Chicken Breast', 'Brown Rice (cooked)', 'Broccoli', 'Bell Pepper', 'Carrot']
  },
  {
    id: 'cmhj8tavq003wdyqvz3h106fh',
    name: 'Salad with Turkey and Quinoa',
    type: 'meal',
    ingredients: ['Turkey Breast', 'Quinoa', 'Salad', 'Tomato', 'Cucumber', 'Avocado']
  },
  {
    id: 'cmhj8tqfx0043dyqvn1rcr6tr',
    name: 'Salmon with Sweet Potatoes and Asparagus',
    type: 'meal',
    ingredients: ['Salmon', 'Sweet Potato', 'Asparagus']
  },
  {
    id: 'cmhj8tr0s0047dyqv3m3zz5z8',
    name: 'Beef Stew with Potatoes and Vegetables',
    type: 'meal',
    ingredients: ['Beef', 'Potato', 'Carrot', 'Onion', 'Bell Pepper']
  },
  {
    id: 'cmhj8u346004ddyqvel9h82pa',
    name: 'Chicken Stir Fry with Vegetables and Noodles',
    type: 'meal',
    ingredients: ['Chicken Breast', 'Pasta (cooked)', 'Bell Pepper', 'Broccoli', 'Carrot', 'Mushrooms']
  },
  {
    id: 'cmhj8u3nd004kdyqvcmy1v96b',
    name: 'Turkey Stew with Lentils and Spinach',
    type: 'meal',
    ingredients: ['Turkey Breast', 'Lentils', 'Spinach', 'Onion', 'Carrot']
  }
];

console.log('Found', recipes.length, 'recipes to fix');
console.log('Will calculate correct amounts for each recipe...\n');

