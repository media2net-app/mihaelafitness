// Script to update all recipes with appropriate labels
const recipes = [
  // Wraps (except breakfast)
  { names: ['Chicken & Avocado Wrap', 'Turkey & Sweet Potato Wrap', 'Beef & Veggie Wrap', 'Pork Wrap'], labels: ['lunch', 'dinner'] },
  { names: ['Breakfast Egg Wrap'], labels: ['breakfast'] },
  
  // All other recipes (lunch/dinner by default)
  { 
    names: [
      'Chicken Breast with Rice and Vegetables',
      'Salad with Turkey and Quinoa',
      'Salmon with Sweet Potatoes and Asparagus',
      'Beef Stew with Potatoes and Vegetables',
      'Chicken Stir Fry with Vegetables and Noodles',
      'Turkey Stew with Lentils and Spinach',
      'Chicken in the Oven with Potatoes and Vegetables Salad',
      'Beef Stew with Rice and Vegetables',
      'Salad with Tuna, Egg and Quinoa',
      'Chicken Curry with Basmati Rice and Vegetables',
      'Turkey in the Oven with Sweet Potatoes and Green Beans',
      'Chicken Stew with Lentils and Spinach',
      'Cod Fillet with Bulgur and Mediterranean Vegetables',
      'Salad with Smoked Salmon and Quinoa',
      'Chicken Breast with Couscous and Vegetables',
      'Salmon with Lentils and Asparagus',
      'Turkey with Couscous and Vegetables',
      'Chicken Stir Fry with Vegetables and Bulgur',
      'Cream Soup of Broccoli with Chicken Breast',
      'Pumpkin Cream Soup with Turkey',
      'Mushrooms Cream Soup with Chicken',
      'Tomatoes Cream Soup',
      'Vegetables Soup',
      'Potato Dish with Chicken',
      'Green Beans Dish with Chicken Thigh',
      'Chicken and Rice Stuffed Rolls',
      'Bell Peppers with Chicken and Rice',
      'Pea Dish with Chicken Breast',
      'Bean Soup with Smoked Meat',
      'Beef Stew with Wine and Mushrooms',
      'Beef Stew with Vegetables',
      'Beef Stew with Potatoes and Carrot',
      'Pork Stew with Potatoes and Bell Pepper',
      'Pork Stew with Cabbage',
      'Pork Stew with Mushrooms and Carrot',
      'Turkey Stew with Vegetables',
      'Beef Stew with Green Beans',
      'Wholemeal Pasta with Chicken Breast and Vegetables',
      'Spaghetti with Tuna and Cherry Tomatoes',
      'Penne with Tomato Sauce and Turkey',
      'Tagliatelle with Salmon and Spinach',
      'Fusilli with Vegetables and Pesto Sauce',
      'Wholemeal Pasta with Beef and Tomatoes',
      'Wholemeal Pasta with Pork and Mushrooms',
      'Fusilli with Chicken, Zucchini and Bell Pepper',
      'Fusilli with Pork and Mushrooms',
      'Spaghetti with Shrimp and Vegetables',
      'Wholemeal Pasta with Yogurt Cream and Spinach',
      'Tagliatelle with Light Mushrooms Cream Sauce',
      'Penne with Tomato Sauce and Avocado',
      'Fusilli with Light Cheese Sauce and Vegetables',
      'Spaghetti with Light Cream Sauce and Salmon',
      'Tagliatelle with Tomato Sauce and Basil',
      'Penne with Zucchini Sauce',
      'Fusilli with Mushrooms Sauce and Chicken Breast',
      'Tagliatelle with Light Cream Sauce, Broccoli and Beef',
      'Bolognese Wheat Pasta with Beef',
      'Meatballs Chicken Soup',
      'Chicken Soup with Vegetables and Noodles',
      'Beef Soup with Vegetables'
    ],
    labels: ['lunch', 'dinner']
  }
];

console.log('Recipe labels update mapping:');
recipes.forEach(({ names, labels }) => {
  console.log(`${names.length} recipes -> ${labels.join(', ')}`);
});

// This script shows the mapping - actual update should be done via API or direct SQL
exports.mapping = recipes;

