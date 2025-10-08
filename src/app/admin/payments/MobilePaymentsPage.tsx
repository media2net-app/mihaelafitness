'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, AlertCircle, CheckCircle, Clock, Filter, Download, RefreshCw, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PaymentOverview {
  summary: {
    totalSubscriptions: number;
    totalRevenue: number;
    totalPaid: number;
    totalOutstanding: number;
    monthlyRevenue: number;
  };
  customerOverview: Array<{
    customerId: string;
    customer: {
      id: string;
      name: string;
      email: string;
    } | null;
    totalRevenue: number;
    totalPaid: number;
    outstanding: number;
    pricingCount: number;
    paymentCount: number;
    lastPayment: string | null;
    lastPricing: string;
  }>;
  distributions: {
    paymentMethods: Record<string, number>;
    paymentTypes: Record<string, number>;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paymentType: string;
    status: string;
    paymentDate: string;
    customer: {
      name: string;
    };
  }>;
  recentPricing: Array<{
    id: string;
    service: string;
    finalPrice: number;
    customer: {
      name: string;
    } | null;
    createdAt: string;
  }>;
}

export default function MobilePaymentsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<PaymentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currency, setCurrency] = useState<'RON' | 'EUR'>('RON');

  // Currency conversion function
  const convertAmount = (amount: number): number => {
    if (currency === 'EUR') {
      return amount / 5; // RON to EUR conversion
    }
    return amount; // RON (original)
  };

  const formatAmount = (amount: number): string => {
    const convertedAmount = convertAmount(amount);
    return `${convertedAmount.toLocaleString()} ${currency}`;
  };

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch('/api/payments/overview');
        if (response.ok) {
          const data = await response.json();
          setOverview(data);
        } else {
          console.error('Failed to fetch payments overview');
        }
      } catch (error) {
        console.error('Error fetching payments overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments overview...</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">Failed to load payments overview. Please try again.</p>
        </div>
      </div>
    );
  }

  const { summary, customerOverview, distributions, recentPayments, recentPricing } = overview;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-rose-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Payments Overview</h1>
              <p className="text-sm text-white/80">Financial overview</p>
            </div>
          </div>
          
          {/* Currency Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setCurrency('RON')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  currency === 'RON'
                    ? 'bg-white text-rose-600'
                    : 'text-white/80'
                }`}
              >
                RON
              </button>
              <button
                onClick={() => setCurrency('EUR')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  currency === 'EUR'
                    ? 'bg-white text-rose-600'
                    : 'text-white/80'
                }`}
              >
                EUR
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards - Mobile Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Subscriptions</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{summary.totalSubscriptions}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Revenue</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatAmount(summary.totalRevenue)}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Paid</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatAmount(summary.totalPaid)}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Outstanding</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatAmount(summary.totalOutstanding)}</p>
          </div>
        </div>

        {/* Monthly Revenue Card */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Monthly Revenue</h3>
              <p className="text-2xl font-bold">{formatAmount(summary.monthlyRevenue)}</p>
              <p className="text-rose-100 text-sm">Last 30 days</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'payments'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'pricing'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'analytics'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Customer Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Overview</h3>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="outstanding">Outstanding</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {customerOverview
                    .filter(customer => {
                      if (filterStatus === 'outstanding') return customer.outstanding > 0;
                      if (filterStatus === 'paid') return customer.outstanding === 0;
                      return true;
                    })
                    .map((customer) => (
                    <div key={customer.customerId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{customer.customer?.name || 'Unknown Customer'}</h4>
                          <p className="text-sm text-gray-500">{customer.customer?.email || 'No email'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.outstanding === 0 
                            ? 'bg-green-100 text-green-800'
                            : customer.outstanding > customer.totalRevenue * 0.5
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {customer.outstanding === 0 ? 'Paid' : 
                           customer.outstanding > customer.totalRevenue * 0.5 ? 'High Outstanding' : 'Partial'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Total Revenue:</span>
                          <p className="font-semibold text-gray-900">{formatAmount(customer.totalRevenue)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Paid:</span>
                          <p className="font-semibold text-green-600">{formatAmount(customer.totalPaid)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Outstanding:</span>
                          <p className="font-semibold text-red-600">{formatAmount(customer.outstanding)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payments:</span>
                          <p className="font-semibold text-gray-900">{customer.paymentCount}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Last Payment: {customer.lastPayment 
                            ? new Date(customer.lastPayment).toLocaleDateString()
                            : 'No payments'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{payment.customer.name}</h4>
                          <p className="text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-green-600">{formatAmount(payment.amount)}</p>
                          <p className="text-sm text-gray-600 capitalize">{payment.paymentMethod} • {payment.paymentType}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Pricing</h3>
                <div className="space-y-3">
                  {recentPricing.map((pricing) => (
                    <div key={pricing.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{pricing.customer?.name || 'Unknown Customer'}</h4>
                          <p className="text-sm text-gray-500">{new Date(pricing.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-rose-600">{formatAmount(pricing.finalPrice)}</p>
                          <p className="text-sm text-gray-600">{pricing.service}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Methods</h4>
                  <div className="space-y-2">
                    {Object.entries(distributions.paymentMethods).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize">{method}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Types</h4>
                  <div className="space-y-2">
                    {Object.entries(distributions.paymentTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize">{type}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

