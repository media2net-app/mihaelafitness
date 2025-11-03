'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
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
  CreditCard,
  Banknote,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Receipt
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Payment Card Component
function PaymentCard({ payment, onEdit, onDelete, onView }: {
  payment: any;
  onEdit: (payment: any) => void;
  onDelete: (payment: any) => void;
  onView: (payment: any) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'refunded': return <TrendingDown className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'bank': return <Receipt className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{payment.clientName}</h3>
            <p className="text-sm text-gray-500">{payment.service} - {payment.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(payment.status)}
              {payment.status}
            </div>
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(payment)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onEdit(payment)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onDelete(payment)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">€{payment.amount}</div>
          <div className="text-xs text-gray-500">Amount</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{payment.fee || '€0'}</div>
          <div className="text-xs text-gray-500">Fee</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{payment.netAmount || payment.amount}</div>
          <div className="text-xs text-gray-500">Net Amount</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{payment.currency || 'EUR'}</div>
          <div className="text-xs text-gray-500">Currency</div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {getPaymentMethodIcon(payment.method)}
            <span>{payment.method}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(payment.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {payment.transactionId ? `#${payment.transactionId}` : 'No ID'}
        </div>
      </div>
    </div>
  );
}

// Financial Overview Component
function FinancialOverview({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">€{stats.totalRevenue}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">+{stats.monthlyGrowth}% this month</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">€{stats.monthlyRevenue}</div>
            <div className="text-sm text-gray-500">This Month</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.completedPayments} completed</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-yellow-500 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">€{stats.pendingAmount}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.pendingCount} payments</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.activeClients}</div>
            <div className="text-sm text-gray-500">Active Clients</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">€{stats.avgPerClient} avg per client</div>
      </div>
    </div>
  );
}

// Payment Method Stats Component
function PaymentMethodStats({ methodStats }: { methodStats: any[] }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methodStats.map((method, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              {method.method === 'card' ? <CreditCard className="w-6 h-6 text-gray-600" /> :
               method.method === 'cash' ? <Banknote className="w-6 h-6 text-gray-600" /> :
               <Receipt className="w-6 h-6 text-gray-600" />}
            </div>
            <div className="text-lg font-bold text-gray-900">€{method.amount}</div>
            <div className="text-sm text-gray-500 capitalize">{method.method}</div>
            <div className="text-xs text-gray-600">{method.count} payments</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PaymentsV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockPayments = [
        {
          id: '1',
          clientName: 'Sarah Johnson',
          service: 'Personal Training',
          description: 'Monthly subscription',
          amount: 120,
          fee: 3.60,
          netAmount: 116.40,
          currency: 'EUR',
          status: 'completed',
          method: 'card',
          date: new Date().toISOString(),
          transactionId: 'TXN001'
        },
        {
          id: '2',
          clientName: 'Mike Chen',
          service: 'Nutrition Plan',
          description: 'Custom meal plan',
          amount: 80,
          fee: 0,
          netAmount: 80,
          currency: 'EUR',
          status: 'pending',
          method: 'cash',
          date: new Date(Date.now() - 86400000).toISOString(),
          transactionId: null
        },
        {
          id: '3',
          clientName: 'Emma Davis',
          service: 'Group Class',
          description: 'Weekly group training',
          amount: 45,
          fee: 1.35,
          netAmount: 43.65,
          currency: 'EUR',
          status: 'completed',
          method: 'bank',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          transactionId: 'TXN003'
        }
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount': return b.amount - a.amount;
      case 'client': return a.clientName.localeCompare(b.clientName);
      default: return 0;
    }
  });

  const stats = {
    totalRevenue: 15420,
    monthlyRevenue: 2450,
    monthlyGrowth: 12.5,
    completedPayments: 18,
    pendingAmount: 320,
    pendingCount: 3,
    activeClients: 15,
    avgPerClient: 163
  };

  const methodStats = [
    { method: 'card', amount: 1890, count: 12 },
    { method: 'cash', amount: 320, count: 3 },
    { method: 'bank', amount: 240, count: 2 }
  ];

  const handleEditPayment = (payment: any) => {
    console.log('Edit payment:', payment);
    // TODO: Implement edit functionality
  };

  const handleDeletePayment = (payment: any) => {
    console.log('Delete payment:', payment);
    // TODO: Implement delete functionality
  };

  const handleViewPayment = (payment: any) => {
    console.log('View payment:', payment);
    // TODO: Implement view functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600 mt-1">Track and manage all client payments and transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Import</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Record Payment</span>
              </button>
            </div>
          </div>

          {/* Financial Overview */}
          <FinancialOverview stats={stats} />

          {/* Payment Method Stats */}
          <PaymentMethodStats methodStats={methodStats} />

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount">Highest Amount</option>
              <option value="client">Client A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {filteredPayments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map(payment => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onEdit={handleEditPayment}
                onDelete={handleDeletePayment}
                onView={handleViewPayment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500 mb-6">Start tracking payments by recording your first transaction</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              <span>Record First Payment</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}








