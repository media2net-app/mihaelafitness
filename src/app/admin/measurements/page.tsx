'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, Calendar, User, Ruler, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Measurement {
  id: string;
  customerId: string;
  customerName: string;
  week: number;
  date: string;
  weight: number;
  height: number;
  age: number;
  chest: number;
  waist: number;
  hips: number;
  thigh: number;
  arm: number;
  neck: number;
  bodyFat: number;
  muscleMass: number;
  bmi: number;
  notes: string;
}

export default function MeasurementsPage() {
  const router = useRouter();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWeek, setFilterWeek] = useState('');

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/customer-measurements');
        if (response.ok) {
          const data = await response.json();
          setMeasurements(data);
        }
      } catch (error) {
        console.error('Error fetching measurements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, []);

  const filteredMeasurements = measurements.filter(measurement => {
    const matchesSearch = measurement.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = filterWeek === '' || measurement.week.toString() === filterWeek;
    return matchesSearch && matchesWeek;
  });

  const handleDeleteMeasurement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) return;

    try {
      const response = await fetch(`/api/customer-measurements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMeasurements(measurements.filter(m => m.id !== id));
        alert('Measurement deleted successfully!');
      } else {
        alert('Failed to delete measurement');
      }
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert('Error deleting measurement');
    }
  };

  const handleAddMeasurement = () => {
    router.push('/admin/clients');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading measurements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">Measurements</h1>
              <p className="text-sm sm:text-base text-gray-600">Track client progress and measurements</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterWeek}
                onChange={(e) => setFilterWeek(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">All Weeks</option>
                {Array.from(new Set(measurements.map(m => m.week))).sort((a, b) => a - b).map(week => (
                  <option key={week} value={week.toString()}>Week {week}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddMeasurement}
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Measurement</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Measurements List */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          {filteredMeasurements.length > 0 ? (
            <div className="space-y-4">
              {filteredMeasurements.map((measurement) => (
                <div key={measurement.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{measurement.customerName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Week {measurement.week} • {new Date(measurement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/clients/${measurement.customerId}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-500 mb-1">Weight</div>
                      <div className="font-semibold text-gray-800">{measurement.weight} kg</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-500 mb-1">BMI</div>
                      <div className="font-semibold text-gray-800">{measurement.bmi}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-500 mb-1">Body Fat</div>
                      <div className="font-semibold text-gray-800">{measurement.bodyFat}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-500 mb-1">Muscle Mass</div>
                      <div className="font-semibold text-gray-800">{measurement.muscleMass} kg</div>
                    </div>
                  </div>
                  
                  {measurement.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">{measurement.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Measurements Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterWeek ? 'No measurements match your search criteria' : 'Add your first measurement to get started'}
              </p>
              <button
                onClick={handleAddMeasurement}
                className="bg-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors duration-200"
              >
                Add Measurement
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
