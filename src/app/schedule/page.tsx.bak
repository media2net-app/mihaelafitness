'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Workout {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  endTime: string;
  duration: number;
  description: string;
  completed: boolean;
  status: string;
  customerName?: string;
  workout?: {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    duration: number;
    trainingType: string;
  };
}

export default function SchedulePage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch workouts from API
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const customerId = user.id;
        
        // Get broader date range to show more sessions (last 30 days and next 60 days)
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 30); // 30 days ago
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 60); // 60 days ahead
        endDate.setHours(23, 59, 59, 999);
        
        const response = await fetch(
          `/api/schedule?customerId=${customerId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setWorkouts(data);
        } else {
          console.error('Failed to fetch workouts');
        }
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [isAuthenticated, user?.id]);

  // Sort workouts by date and time
  const sortedWorkouts = [...workouts].sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading schedule...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Mijn Trainingen</h1>
          <p className="text-gray-600">Hieronder zie je alle trainingen die door je coach zijn ingepland.</p>
        </div>

        {/* Schedule Table */}
        {sortedWorkouts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Geen trainingen ingepland</h3>
            <p className="text-gray-500">Je coach heeft nog geen trainingen voor je ingepland.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Datum</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tijd</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Duur</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Opmerkingen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedWorkouts.map((workout) => (
                    <tr 
                      key={workout.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        workout.completed ? 'bg-green-50/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(workout.date).toLocaleDateString('nl-NL', { 
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {workout.time} - {workout.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{workout.title}</div>
                        <div className="text-sm text-gray-500">{workout.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {workout.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          workout.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : workout.status === 'scheduled' || workout.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : workout.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workout.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                          {workout.status === 'completed' ? 'Afgerond' : 
                           workout.status === 'scheduled' || workout.status === 'confirmed' ? 'Gepland' :
                           workout.status === 'cancelled' ? 'Geannuleerd' : workout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {workout.description || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
