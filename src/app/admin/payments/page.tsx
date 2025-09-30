'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, AlertCircle, CheckCircle, Clock, Filter, Download, RefreshCw } from 'lucide-react';

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

export default function PaymentsPage() {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments Overview</h1>
              <p className="mt-2 text-gray-600">Complete financial overview of all subscriptions and payments</p>
            </div>
            
            {/* Currency Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Currency:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrency('RON')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    currency === 'RON'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  RON
                </button>
                <button
                  onClick={() => setCurrency('EUR')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    currency === 'EUR'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EUR
                </button>
              </div>
              {currency === 'EUR' && (
                <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                  1 EUR = 5 RON
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(summary.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(summary.totalPaid)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(summary.totalOutstanding)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Card */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-white">{formatAmount(summary.monthlyRevenue)}</p>
              <p className="text-rose-100">Last 30 days</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Customer Overview
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Payments
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pricing'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Pricing
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Customer Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Financial Overview</h3>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                    >
                      <option value="all">All Customers</option>
                      <option value="outstanding">With Outstanding</option>
                      <option value="paid">Fully Paid</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Revenue</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Paid</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Outstanding</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Payments</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Payment</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerOverview
                        .filter(customer => {
                          if (filterStatus === 'outstanding') return customer.outstanding > 0;
                          if (filterStatus === 'paid') return customer.outstanding === 0;
                          return true;
                        })
                        .map((customer) => (
                        <tr key={customer.customerId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{customer.customer?.name || 'Unknown Customer'}</div>
                              <div className="text-sm text-gray-500">{customer.customer?.email || 'No email'}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              customer.serviceTypes?.includes('Group Training') 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {customer.serviceTypes || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-900">
                            {formatAmount(customer.totalRevenue)}
                          </td>
                          <td className="py-4 px-4 font-semibold text-green-600">
                            {formatAmount(customer.totalPaid)}
                          </td>
                          <td className="py-4 px-4 font-semibold text-red-600">
                            {formatAmount(customer.outstanding)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {customer.paymentCount} payments
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {customer.lastPayment 
                              ? new Date(customer.lastPayment).toLocaleDateString()
                              : 'No payments'
                            }
                          </td>
                          <td className="py-4 px-4">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Payments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {payment.customer.name}
                          </td>
                          <td className="py-4 px-4 font-bold text-green-600">
                            {formatAmount(payment.amount)}
                          </td>
                          <td className="py-4 px-4 text-gray-600 capitalize">
                            {payment.paymentMethod}
                          </td>
                          <td className="py-4 px-4 text-gray-600 capitalize">
                            {payment.paymentType}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Pricing Calculations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPricing.map((pricing) => (
                        <tr key={pricing.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(pricing.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {pricing.customer?.name || 'Unknown Customer'}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pricing.serviceType === 'Group Training' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {pricing.serviceType || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-rose-600">
                            {formatAmount(pricing.finalPrice)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h4>
                  <div className="space-y-3">
                    {Object.entries(distributions.paymentMethods).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize">{method}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Types</h4>
                  <div className="space-y-3">
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

