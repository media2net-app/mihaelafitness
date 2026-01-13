'use client';

import { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Download,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  FileText,
  Save,
  RefreshCw,
  Zap,
  Star,
  Tag
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Pricing Calculation Card Component
function PricingCard({ calculation, onEdit, onDelete, onView, onCopy }: {
  calculation: any;
  onEdit: (calculation: any) => void;
  onDelete: (calculation: any) => void;
  onView: (calculation: any) => void;
  onCopy: (calculation: any) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'archived': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{calculation.name}</h3>
            <p className="text-sm text-gray-500">{calculation.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(calculation.status)}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(calculation.status)}
              {calculation.status}
            </div>
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(calculation)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onEdit(calculation)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onCopy(calculation)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button onClick={() => onDelete(calculation)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">€{calculation.basePrice || '--'}</div>
          <div className="text-xs text-gray-500">Base Price</div>
          <div className="text-xs text-gray-400">per session</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{calculation.sessions || '--'}</div>
          <div className="text-xs text-gray-500">Sessions</div>
          <div className="text-xs text-gray-400">per month</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">€{calculation.totalPrice || '--'}</div>
          <div className="text-xs text-gray-500">Total Price</div>
          <div className="text-xs text-gray-400">per month</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{calculation.discount || '0'}%</div>
          <div className="text-xs text-gray-500">Discount</div>
          <div className="text-xs text-gray-400">applied</div>
        </div>
      </div>

      {/* Additional Services */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Services Included:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {calculation.services?.map((service: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{calculation.clientCount || 0} clients</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{calculation.duration || '--'} months</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Created {new Date(calculation.createdAt).toLocaleDateString()}
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
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.totalCalculations}</div>
            <div className="text-sm text-gray-500">Total Calculations</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">+{stats.newThisMonth} this month</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">€{stats.avgPrice}</div>
            <div className="text-sm text-gray-500">Avg Price</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">per calculation</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.activeCalculations}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">currently in use</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.conversionRate}</div>
            <div className="text-sm text-gray-500">Conversion Rate</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">% calculations used</div>
      </div>
    </div>
  );
}

// Pricing Calculator Builder Component
function PricingCalculatorBuilder() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    sessions: '',
    duration: '',
    discount: '',
    services: []
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(formData.basePrice) || 0;
    const sessions = parseInt(formData.sessions) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    const subtotal = basePrice * sessions;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    return { subtotal, discountAmount, total };
  };

  const { subtotal, discountAmount, total } = calculateTotal();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pricing Calculator Builder</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Save className="w-4 h-4" />
          <span>Save Template</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Calculation Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Personal Training Package"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe this pricing package..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (€)</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sessions/Month</label>
              <input
                type="number"
                value={formData.sessions}
                onChange={(e) => handleInputChange('sessions', e.target.value)}
                placeholder="8"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="3"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Calculation Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Calculation Preview</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount ({formData.discount}%):</span>
              <span className="font-medium text-green-600">-€{discountAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-emerald-600">€{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Per month for {formData.duration || '--'} months
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingCalculatorV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [calculations, setCalculations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockCalculations = [
        {
          id: '1',
          name: 'Personal Training Package',
          description: 'One-on-one training sessions with personalized workout plans',
          status: 'Active',
          basePrice: 75,
          sessions: 8,
          duration: 3,
          discount: 15,
          totalPrice: 510,
          services: ['Personal Training', 'Nutrition Plan', 'Progress Tracking'],
          clientCount: 12,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Group Fitness Classes',
          description: 'High-energy group workouts for all fitness levels',
          status: 'Active',
          basePrice: 25,
          sessions: 12,
          duration: 1,
          discount: 10,
          totalPrice: 270,
          services: ['Group Classes', 'Equipment Access', 'Community Support'],
          clientCount: 28,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          name: 'Nutrition Coaching Only',
          description: 'Comprehensive nutrition guidance and meal planning',
          status: 'Draft',
          basePrice: 50,
          sessions: 4,
          duration: 2,
          discount: 5,
          totalPrice: 190,
          services: ['Meal Plans', 'Macro Tracking', 'Weekly Check-ins'],
          clientCount: 8,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
      
      setCalculations(mockCalculations);
    } catch (error) {
      console.error('Error loading calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCalculations = calculations.filter(calculation => {
    const matchesSearch = calculation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         calculation.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || calculation.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name': return a.name.localeCompare(b.name);
      case 'price': return b.totalPrice - a.totalPrice;
      default: return 0;
    }
  });

  const stats = {
    totalCalculations: calculations.length,
    newThisMonth: 5,
    avgPrice: Math.round(calculations.reduce((sum, c) => sum + c.totalPrice, 0) / calculations.length),
    activeCalculations: calculations.filter(c => c.status === 'Active').length,
    conversionRate: 78
  };

  const handleEditCalculation = (calculation: any) => {
    console.log('Edit calculation:', calculation);
    // TODO: Implement edit functionality
  };

  const handleDeleteCalculation = (calculation: any) => {
    console.log('Delete calculation:', calculation);
    // TODO: Implement delete functionality
  };

  const handleViewCalculation = (calculation: any) => {
    console.log('View calculation:', calculation);
    // TODO: Implement view functionality
  };

  const handleCopyCalculation = (calculation: any) => {
    console.log('Copy calculation:', calculation);
    // TODO: Implement copy functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing calculations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pricing Calculator</h1>
              <p className="text-gray-600 mt-1">Create and manage pricing packages for your services</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>New Calculation</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={stats} />

          {/* Pricing Calculator Builder */}
          <PricingCalculatorBuilder />

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search calculations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="price">Highest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {filteredCalculations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalculations.map(calculation => (
              <PricingCard
                key={calculation.id}
                calculation={calculation}
                onEdit={handleEditCalculation}
                onDelete={handleDeleteCalculation}
                onView={handleViewCalculation}
                onCopy={handleCopyCalculation}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing calculations found</h3>
            <p className="text-gray-500 mb-6">Create your first pricing package to get started</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              <span>Create First Calculation</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}













