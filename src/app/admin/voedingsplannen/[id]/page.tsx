import NutritionPlanDetailClient from './NutritionPlanDetailClient';

export default function NutritionPlanDetailPage({ params }: { params: { id: string } }) {
  return <NutritionPlanDetailClient params={params} />;
}
