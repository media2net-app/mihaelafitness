const weight = 88;
const mb = 88 * 24; // 2112

// Alle percentages op MB
let total = mb;
total += mb * 0.05; // Ectomorf
total += mb * 0.10; // Creștere
total += mb * 0.10; // Activitate

console.log('Voor training:', Math.round(total));

// Variant 1: Training per dag (gedeeld door 7)
const training1 = total + (88 * 1 * 6) / 7;
console.log('Training/dag:', Math.round(training1), 'kcal');

// Variant 2: Training per week direct
const training2 = total + (88 * 1 * 6);
console.log('Training/week (direct):', Math.round(training2), 'kcal');

// Variant 3: Training met gemiddelde intensiteit 5.5
const training3 = total + (88 * 1 * 5.5) / 7;
console.log('Training/dag (intensiteit 5.5):', Math.round(training3), 'kcal');

// Variant 4: Training met 2 uur/week
const training4 = total + (88 * 2 * 6) / 7;
console.log('Training/dag (2u/week):', Math.round(training4), 'kcal');
