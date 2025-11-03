// Verify the exact calculation
const weight = 88;
const mb = 88 * 24; // 2112

// Alle percentages op MB
let total = mb; // 2112
console.log('MB:', total);

total += mb * 0.05; // Ectomorf +5% = +106
console.log('+ Ectomorf (5%):', Math.round(total));

total += mb * 0.10; // Creștere +10% = +211
console.log('+ Creștere (10%):', Math.round(total));

total += mb * 0.10; // Activitate +10% = +211
console.log('+ Activitate (10%):', Math.round(total));

total += (88 * 1 * 6) / 7; // Training per dag = +75
console.log('+ Training (1u/week):', Math.round(total));

console.log('\nTOTAAL:', Math.round(total), 'kcal');
