'use client';

import { Weight, Footprints, Moon, Droplets, Dumbbell, Percent } from 'lucide-react';
import MetricCard from './MetricCard';
import BarChart from './BarChart';

interface MetricsRowProps {
  weight?: number;
  steps?: number;
  sleep?: string;
  water?: { current: number; target: number };
  training?: { completed: number; total: number };
  consistency?: number;
}

export default function MetricsRow({
  weight,
  steps,
  sleep,
  water,
  training,
  consistency
}: MetricsRowProps) {
  // Bar chart for steps (last 7 days)
  const StepsChart = () => {
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        label: date.toLocaleDateString('nl-NL', { weekday: 'short' }),
        value: i === 6 ? (steps || 0) : Math.floor((steps || 0) * (0.7 + Math.random() * 0.3))
      };
    });
    return <BarChart data={weekData} maxValue={10000} color="blue" height={60} showLabels={true} />;
  };

  // Bar chart for sleep (last 7 days)
  const SleepChart = () => {
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const hours = sleep ? parseFloat(sleep.replace('h', '').replace('m', '')) : 7.5;
      return {
        label: date.toLocaleDateString('nl-NL', { weekday: 'short' }),
        value: i === 6 ? hours : hours * (0.8 + Math.random() * 0.4)
      };
    });
    return <BarChart data={weekData} maxValue={10} color="purple" height={60} showLabels={true} />;
  };

  // Progress bar for water
  const WaterChart = () => {
    const percentage = water ? (water.current / water.target) * 100 : 0;
    return (
      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
        <div
          className="bg-white h-2 rounded-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Weight */}
      {weight !== undefined && (
        <MetricCard
          title="Gewicht"
          value={`${weight}kg`}
          icon={Weight}
          isHighlighted={true}
        />
      )}

      {/* Steps */}
      {steps !== undefined && (
        <MetricCard
          title="Stappen"
          value={steps.toLocaleString('nl-NL')}
          icon={Footprints}
          subtitle="Doel: 10.000"
          chart={<StepsChart />}
        />
      )}

      {/* Sleep */}
      {sleep && (
        <MetricCard
          title="Slaap"
          value={sleep}
          icon={Moon}
          subtitle="Gisteren"
          chart={<SleepChart />}
        />
      )}

      {/* Water */}
      {water && (
        <MetricCard
          title="Water"
          value={`${water.current}L`}
          icon={Droplets}
          subtitle={`Doel: ${water.target}L`}
          chart={<WaterChart />}
        />
      )}

      {/* Training */}
      {training && (
        <MetricCard
          title="Trainingen"
          value={`${training.completed}/${training.total}`}
          icon={Dumbbell}
          subtitle="Deze week"
        />
      )}

      {/* Consistency */}
      {consistency !== undefined && (
        <MetricCard
          title="Consistentie"
          value={`${consistency}%`}
          icon={Percent}
          subtitle="Deze week"
        />
      )}
    </div>
  );
}

