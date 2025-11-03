'use client';

import { useState, useEffect } from 'react';
import { 
  Ruler, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  Users,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Measurement Card Component
function MeasurementCard({ measurement, onEdit, onDelete, onView }: {
  measurement: any;
  onEdit: (measurement: any) => void;
  onDelete: (measurement: any) => void;
  onView: (measurement: any) => void;
}) {
  const getProgressColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProgressIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <div className="w-4 h-4 border-t-2 border-gray-400"></div>;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Ruler className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{measurement.clientName}</h3>
            <p className="text-sm text-gray-500">Week {measurement.week} - {new Date(measurement.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(measurement)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onEdit(measurement)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onDelete(measurement)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Measurements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {measurement.weight && (
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{measurement.weight}kg</div>
            <div className="text-xs text-gray-500">Weight</div>
            {measurement.weightChange && (
              <div className={`flex items-center justify-center gap-1 text-xs ${getProgressColor(measurement.weightChange)}`}>
                {getProgressIcon(measurement.weightChange)}
                <span>{measurement.weightChange > 0 ? '+' : ''}{measurement.weightChange.toFixed(1)}kg</span>
              </div>
            )}
          </div>
        )}
        {measurement.waist && (
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{measurement.waist}cm</div>
            <div className="text-xs text-gray-500">Waist</div>
            {measurement.waistChange && (
              <div className={`flex items-center justify-center gap-1 text-xs ${getProgressColor(measurement.waistChange)}`}>
                {getProgressIcon(measurement.waistChange)}
                <span>{measurement.waistChange > 0 ? '+' : ''}{measurement.waistChange.toFixed(1)}cm</span>
              </div>
            )}
          </div>
        )}
        {measurement.chest && (
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{measurement.chest}cm</div>
            <div className="text-xs text-gray-500">Chest</div>
            {measurement.chestChange && (
              <div className={`flex items-center justify-center gap-1 text-xs ${getProgressColor(measurement.chestChange)}`}>
                {getProgressIcon(measurement.chestChange)}
                <span>{measurement.chestChange > 0 ? '+' : ''}{measurement.chestChange.toFixed(1)}cm</span>
              </div>
            )}
          </div>
        )}
        {measurement.bodyFat && (
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{measurement.bodyFat}%</div>
            <div className="text-xs text-gray-500">Body Fat</div>
            {measurement.bodyFatChange && (
              <div className={`flex items-center justify-center gap-1 text-xs ${getProgressColor(measurement.bodyFatChange)}`}>
                {getProgressIcon(measurement.bodyFatChange)}
                <span>{measurement.bodyFatChange > 0 ? '+' : ''}{measurement.bodyFatChange.toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{measurement.goal || 'No goal set'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{measurement.age || '--'} years old</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {measurement.measurementCount || 1} measurements
        </div>
      </div>
    </div>
  );
}

// Bulk Operations Component
function BulkOperations({ selectedItems, onBulkDelete, onBulkExport }: {
  selectedItems: any[];
  onBulkDelete: () => void;
  onBulkExport: () => void;
}) {
  if (selectedItems.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800 font-medium">
            {selectedItems.length} measurement{selectedItems.length > 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBulkExport}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick Stats Component
function QuickStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Ruler className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.totalMeasurements}</div>
            <div className="text-sm text-gray-500">Total Measurements</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">+{stats.thisWeek} this week</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.activeClients}</div>
            <div className="text-sm text-gray-500">Active Clients</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.avgPerClient} avg per client</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-red-500 rounded-lg">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.weightLoss}</div>
            <div className="text-sm text-gray-500">Weight Loss</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">kg lost this month</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.progressRate}</div>
            <div className="text-sm text-gray-500">Progress Rate</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">% clients improving</div>
      </div>
    </div>
  );
}

export default function MeasurementsV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockMeasurements = [
        {
          id: '1',
          clientName: 'Sarah Johnson',
          week: 4,
          date: new Date().toISOString(),
          weight: 65.2,
          waist: 75,
          chest: 95,
          bodyFat: 18,
          age: 28,
          goal: 'Weight Loss',
          weightChange: -2.1,
          waistChange: -3.5,
          chestChange: -1.2,
          bodyFatChange: -2.1,
          measurementCount: 4
        },
        {
          id: '2',
          clientName: 'Mike Chen',
          week: 6,
          date: new Date(Date.now() - 86400000).toISOString(),
          weight: 78.5,
          waist: 82,
          chest: 105,
          bodyFat: 12,
          age: 32,
          goal: 'Muscle Gain',
          weightChange: 3.2,
          waistChange: 1.0,
          chestChange: 4.5,
          bodyFatChange: -1.5,
          measurementCount: 6
        },
        {
          id: '3',
          clientName: 'Emma Davis',
          week: 2,
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          weight: 58.8,
          waist: 68,
          chest: 88,
          bodyFat: 22,
          age: 25,
          goal: 'Weight Loss',
          weightChange: -1.5,
          waistChange: -2.0,
          chestChange: -0.8,
          bodyFatChange: -1.8,
          measurementCount: 2
        }
      ];
      
      setMeasurements(mockMeasurements);
    } catch (error) {
      console.error('Error loading measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeasurements = measurements.filter(measurement => {
    const matchesSearch = measurement.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWeek = filterWeek === 'all' || measurement.week.toString() === filterWeek;
    return matchesSearch && matchesWeek;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'client': return a.clientName.localeCompare(b.clientName);
      case 'week': return b.week - a.week;
      default: return 0;
    }
  });

  const stats = {
    totalMeasurements: measurements.length,
    thisWeek: 8,
    activeClients: 12,
    avgPerClient: 3.2,
    weightLoss: 15.8,
    progressRate: 87
  };

  const handleSelectItem = (measurement: any) => {
    setSelectedItems(prev => 
      prev.includes(measurement) 
        ? prev.filter(item => item.id !== measurement.id)
        : [...prev, measurement]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(selectedItems.length === filteredMeasurements.length ? [] : filteredMeasurements);
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', selectedItems);
    setSelectedItems([]);
    // TODO: Implement bulk delete
  };

  const handleBulkExport = () => {
    console.log('Bulk export:', selectedItems);
    // TODO: Implement bulk export
  };

  const handleEditMeasurement = (measurement: any) => {
    console.log('Edit measurement:', measurement);
    // TODO: Implement edit functionality
  };

  const handleDeleteMeasurement = (measurement: any) => {
    console.log('Delete measurement:', measurement);
    // TODO: Implement delete functionality
  };

  const handleViewMeasurement = (measurement: any) => {
    router.push(`/admin/v2/clients/${measurement.clientId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading measurements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold text-gray-900">Measurements</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and analyze client progress over time</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="text-gray-700 hidden sm:inline">Import</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="text-gray-700 hidden sm:inline">Export</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Measurement</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={stats} />

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search measurements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Weeks</option>
              <option value="1">Week 1</option>
              <option value="2">Week 2</option>
              <option value="3">Week 3</option>
              <option value="4">Week 4</option>
              <option value="5">Week 5</option>
              <option value="6">Week 6</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="client">Client A-Z</option>
              <option value="week">Week Descending</option>
            </select>
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">
                {selectedItems.length === filteredMeasurements.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Bulk Operations */}
        <BulkOperations
          selectedItems={selectedItems}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
        />

        {filteredMeasurements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeasurements.map(measurement => (
              <div key={measurement.id} className="relative">
                {selectedItems.includes(measurement) && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <div 
                  className={`cursor-pointer ${selectedItems.includes(measurement) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleSelectItem(measurement)}
                >
                  <MeasurementCard
                    measurement={measurement}
                    onEdit={handleEditMeasurement}
                    onDelete={handleDeleteMeasurement}
                    onView={handleViewMeasurement}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No measurements found</h3>
            <p className="text-gray-500 mb-6">Start tracking client progress by adding measurements</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              <span>Add First Measurement</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
