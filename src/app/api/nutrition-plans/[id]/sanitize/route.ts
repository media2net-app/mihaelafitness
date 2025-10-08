import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
const MEALS = ['breakfast','snack','lunch','dinner'] as const;

// Placeholder phrases to remove completely from meal strings
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /personalized\s+breakfast\s+based\s+on\s+your\s+goals/i,
  /healthy\s+snack\s+to\s+support\s+your\s+nutrition\s+goals/i,
  /balanced\s+lunch\s+with\s+optimal\s+macronutrients/i,
  /nutritious\s+dinner\s+to\s+complete\s+your\s+daily\s+intake/i,
  /personalized.*based\s+on.*goals/i,
  /healthy.*to\s+support.*nutrition/i,
  /balanced.*with\s+optimal.*macronutrients/i,
  /nutritious.*to\s+complete.*daily/i
];

function cleanMealString(input: unknown): string {
  if (typeof input !== 'string') return '';
  let s = input.trim();

  // Remove placeholder phrases wherever they appear
  for (const pattern of PLACEHOLDER_PATTERNS) {
    s = s.replace(pattern, '').trim();
  }

  // If there is a ":", keep only the part after the colon (common format: "Title: ingredients")
  if (s.includes(':')) {
    const after = s.split(':')[1]?.trim() ?? '';
    if (after) s = after;
  }

  // If there are separators, split and remove empty/placeholder-only segments
  const splitOn = /[,+]/;
  const parts = s.split(splitOn)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .filter(p => !PLACEHOLDER_PATTERNS.some(rx => rx.test(p)));

  // Re-join as ingredients list
  s = parts.join(', ');

  // Final tidy: remove duplicate commas/spaces
  s = s.replace(/\s*,\s*,+/g, ', ').replace(/\s{2,}/g, ' ').replace(/^,\s*|,\s*$/g, '');

  // Convert malformed 'Ng N Slice Name' -> 'N Slice Name'
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*g\s+(\d+(?:\.\d+)?)\s+(slice|slices)\s+([^,]+)/gi, (_m, _g, n, _sl, rest) => {
    return `${n} Slice ${String(rest).trim()}`;
  });
  // Convert 'Ng Slice Name' (with no explicit piece count) -> keep name but drop grams
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*g\s+(slice|slices)\s+([^,]+)/gi, (_m, _g, _sl, rest) => {
    return `1 Slice ${String(rest).trim()}`;
  });
  // Collapse extra spaces around Slice
  s = s.replace(/\bSlice\s+/g, 'Slice ').replace(/\s+Slice\b/g, ' Slice');

  return s.trim();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const plan = await prisma.nutritionPlan.findUnique({ where: { id } });
    if (!plan) {
      return NextResponse.json({ error: 'Nutrition plan not found' }, { status: 404 });
    }

    const originalMenu: any = plan.weekMenu || {};
    const updatedMenu: any = { ...originalMenu };

    // Build piece ingredient name set from DB
    const allIngredients = await prisma.ingredient.findMany({});
    const pieceNames = new Set<string>();
    for (const it of allIngredients) {
      const perVal = String((it as any).per || '').toLowerCase();
      const aliasesVal = (it as any).aliases;
      const aliasesArr: string[] = Array.isArray(aliasesVal)
        ? aliasesVal as string[]
        : typeof aliasesVal === 'string'
          ? String(aliasesVal).split(',').map(s => s.trim())
          : [];
      const isPiece = /\bpiece\b/.test(perVal) || aliasesArr.some(a => a?.toUpperCase?.().includes('TYPE:PIECE'));
      const name = String((it as any).name || '').toLowerCase();
      if (isPiece && name) pieceNames.add(name);
    }

    const normalizeWithDB = (s: string): string => {
      if (!s) return s;
      // Split on commas and normalize each part
      const parts = s.split(',').map(p => p.trim()).filter(Boolean);
      const normalized = parts.map(part => {
        let ing = part;
        // Case A: "Ng 1 Name" -> "1 Name"
        let m = ing.match(/^\s*(\d+(?:\.\d+)?)\s*g\s+(\d+)\s+(.+)$/i);
        if (m) {
          const pieces = m[2];
          const name = m[3];
          return `${pieces} ${name}`;
        }
        // Case B: "1g Name" & Name ∈ pieceSet -> "1 Name"
        m = ing.match(/^\s*1\s*g\s+(.+)$/i);
        if (m) {
          const name = m[1].trim();
          if (pieceNames.has(name.toLowerCase())) return `1 ${name}`;
        }
        // Case C: "Ng Name" & Name ∈ pieceSet & N ≤ 5 -> interpret as pieces
        m = ing.match(/^\s*(\d+(?:\.\d+)?)\s*g\s+(.+)$/i);
        if (m) {
          const grams = parseFloat(m[1]);
          const name = m[2].trim();
          if (pieceNames.has(name.toLowerCase()) && grams <= 5) {
            return `${Math.max(1, Math.round(grams))} ${name}`;
          }
        }
        return ing;
      });
      return normalized.join(', ');
    };

    for (const day of DAYS) {
      const dayMenu = originalMenu[day] || {};
      const newDay: Record<string, string> = { ...dayMenu };

      for (const meal of MEALS) {
        const cleaned = cleanMealString(dayMenu[meal]);
        const normalized = normalizeWithDB(cleaned);
        newDay[meal] = normalized; // can be '' if nothing remains
      }

      updatedMenu[day] = newDay;
    }

    const updated = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        weekMenu: updatedMenu,
      },
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (error) {
    console.error('Error sanitizing nutrition plan placeholders:', error);
    return NextResponse.json({ error: 'Failed to sanitize placeholders' }, { status: 500 });
  }
}
