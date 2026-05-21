import NutritionPlanDetailClient from './NutritionPlanDetailClient';

export const dynamic = 'force-dynamic';

export default async function NutritionPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <NutritionPlanDetailClient params={resolvedParams} />;
}
