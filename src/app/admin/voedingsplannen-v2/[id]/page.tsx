import NutritionPlanV2Client from './NutritionPlanV2Client';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <NutritionPlanV2Client params={resolvedParams} />;
}
