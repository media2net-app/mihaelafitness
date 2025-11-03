import { Metadata } from 'next';
import NutritionPlanV3Client from './NutritionPlanV3Client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Nutrition Plan V3 - ${id}`,
    description: 'Clean nutrition plan editor with proper macro calculations',
  };
}

export default async function NutritionPlanV3Page({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NutritionPlanV3Client planId={id} />
    </div>
  );
}

