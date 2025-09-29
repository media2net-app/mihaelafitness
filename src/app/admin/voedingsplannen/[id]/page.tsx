import NutritionPlanDetailClient from './NutritionPlanDetailClient';

export default function NutritionPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <NutritionPlanDetailClient params={params} />;
}
