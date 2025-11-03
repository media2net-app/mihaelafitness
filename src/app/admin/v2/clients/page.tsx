'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Eye, Edit, Trash2, Phone, Calendar, Star, Dumbbell, X, Save, Target, Mail, User, Filter, MoreVertical, TrendingUp, Clock, CheckCircle, AlertCircle, Euro } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, pricingService } from '@/lib/database';

// Modern Client Card Component
function ClientCard({ client, onView, onDelete }: { 
  client: any; 
  onView: (id: string) => void; 
  onDelete: (client: {id: string, name: string}) => void; 
}) {
  // Check if this is an admin user
  const isAdmin = client.email === 'info@mihaelafitness.com' || client.email === 'mihaela@mihaelafitness.com' || client.email === 'chiel@media2net.nl';
  const isMihaela = client.email === 'info@mihaelafitness.com' || client.email === 'mihaela@mihaelafitness.com';
  const isChiel = client.email === 'chiel@media2net.nl';

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'intake': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'inactive': return <AlertCircle className="w-3 h-3" />;
      case 'intake': return <Clock className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  // Get admin card colors
  const adminCardColors = isMihaela 
    ? 'bg-gradient-to-br from-pink-500 to-rose-600 border-pink-300' 
    : isChiel
    ? 'bg-gradient-to-br from-blue-500 to-cyan-600 border-blue-300'
    : 'bg-gradient-to-br from-blue-500 to-purple-600';

  return (
    <div className={`group rounded-2xl shadow-sm border-2 ${isAdmin ? adminCardColors : 'bg-white border-gray-100'} hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 pb-4 ${isAdmin ? 'text-white' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {client.profilePicture ? (
                <div className={`w-14 h-14 ${isAdmin ? 'border-2 border-white/30' : 'border-2 border-gray-200'} rounded-2xl overflow-hidden shadow-lg`}>
                  <img 
                    src={client.profilePicture} 
                    alt={client.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={`w-14 h-14 ${isAdmin ? 'bg-white/20 backdrop-blur-sm border-2 border-white/30' : adminCardColors} rounded-2xl flex items-center justify-center ${isAdmin ? 'text-white' : 'text-white'} font-bold text-lg shadow-lg`}>
                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              {isAdmin ? (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-white/90 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">A</span>
                </div>
              ) : (
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${getStatusColor(client.status)}`}>
                  {getStatusIcon(client.status)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-semibold ${isAdmin ? 'text-white' : 'text-gray-900'} truncate`}>{client.name}</h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                    ADMIN
                  </span>
                )}
              </div>
              <p className={`text-sm ${isAdmin ? 'text-white/80' : 'text-gray-500'} truncate`}>{client.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {!isAdmin && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                )}
                {client.groupName && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAdmin ? 'bg-white/20 text-white border border-white/30' : 'bg-purple-100 text-purple-800 border border-purple-200'}`}>
                    {client.groupName}
                  </span>
                )}
                {client.rating && (
                  <div className="flex items-center gap-1">
                    <Star className={`w-3 h-3 ${isAdmin ? 'text-yellow-200' : 'text-yellow-400'} fill-current`} />
                    <span className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-600'}`}>{client.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(client.id)}
              className={`p-2 ${isAdmin ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'} rounded-xl transition-colors`}
              title="View Client"
            >
              <Eye className="w-4 h-4" />
            </button>
            {!isAdmin && (
              <button
                onClick={() => onDelete({id: client.id, name: client.name})}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete Client"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className={`text-center ${isAdmin ? 'text-white' : ''}`}>
            {(() => {
              const expectedTotal = (client.subscriptionDuration && client.trainingFrequency)
                ? client.subscriptionDuration * client.trainingFrequency
                : (client.totalSessions || 0);
              const completed = client.completedSessions || 0;
              const percentage = expectedTotal > 0 ? Math.round((completed / expectedTotal) * 100) : 0;
              const remaining = expectedTotal - completed;
              const weeksRemaining = client.trainingFrequency > 0 ? Math.ceil(remaining / client.trainingFrequency) : 0;
              
                  return (
                <>
                  <div className={`text-xl font-bold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>{`${completed}/${expectedTotal}`}</div>
                  <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'} mb-1`}>Sessions</div>
                  {expectedTotal > 0 && (
                    <>
                      <div className={`w-full ${isAdmin ? 'bg-white/20' : 'bg-gray-200'} rounded-full h-1.5 mb-1`}>
                        <div 
                          className={`${isAdmin ? 'bg-white' : 'bg-blue-500'} h-1.5 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>{percentage}% • {weeksRemaining}w</div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
          <div className={`text-center ${isAdmin ? 'text-white' : ''}`}>
            <div className={`text-xl font-bold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>{client.trainingFrequency || 0}</div>
            <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>Per Week</div>
          </div>
          <div className={`text-center ${isAdmin ? 'text-white' : ''}`}>
            <div className={`text-xl font-bold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>{client.measurementsCount || 0}</div>
            <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>Measurements</div>
          </div>
          <div className={`text-center ${isAdmin ? 'text-white' : ''}`}>
            {(() => {
              const photosCount = client.photosCount || 0;
              const measurementsCount = client.measurementsCount || 0;
              const expectedPhotos = measurementsCount * 3;
              const isMissingPhotos = photosCount < expectedPhotos;
              
              return (
                <>
                  <div className={`text-xl font-bold ${isMissingPhotos ? 'text-red-500' : (isAdmin ? 'text-white' : 'text-gray-900')}`}>
                    {photosCount}
                  </div>
                  <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>Photos</div>
                  {isMissingPhotos && expectedPhotos > 0 && (
                    <div className={`text-xs ${isAdmin ? 'text-white/90' : 'text-red-500'} mt-1`}>
                      Need {expectedPhotos - photosCount} more
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Additional Info */}
        <div className={`space-y-2 text-sm ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(client.joinDate).toLocaleDateString()}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
            )}
          </div>
          
          {/* Next Payment Info */}
          {client.paymentInfo && client.paymentInfo.nextPaymentDate && !client.paymentInfo.isPaid && (
            <div className={`flex items-center justify-between p-2 rounded-lg ${
              client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil < 0
                ? isAdmin ? 'bg-red-500/30' : 'bg-red-50 border border-red-200'
                : client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil <= 7
                ? isAdmin ? 'bg-orange-500/30' : 'bg-orange-50 border border-orange-200'
                : isAdmin ? 'bg-white/10' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                <Euro className={`w-4 h-4 ${
                  client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil < 0
                    ? isAdmin ? 'text-white' : 'text-red-600'
                    : client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil <= 7
                    ? isAdmin ? 'text-white' : 'text-orange-600'
                    : isAdmin ? 'text-white/80' : 'text-blue-600'
                }`} />
                <span className={`text-xs font-medium ${
                  client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil < 0
                    ? isAdmin ? 'text-white' : 'text-red-800'
                    : client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil <= 7
                    ? isAdmin ? 'text-white' : 'text-orange-800'
                    : isAdmin ? 'text-white/90' : 'text-blue-800'
                }`}>
                  Next Payment
                </span>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold ${
                  client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil < 0
                    ? isAdmin ? 'text-white' : 'text-red-700'
                    : client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil <= 7
                    ? isAdmin ? 'text-white' : 'text-orange-700'
                    : isAdmin ? 'text-white' : 'text-blue-700'
                }`}>
                  {client.paymentInfo.amount} RON
                </div>
                <div className={`text-xs ${
                  client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil < 0
                    ? isAdmin ? 'text-white/90' : 'text-red-600'
                    : client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil <= 7
                    ? isAdmin ? 'text-white/90' : 'text-orange-600'
                    : isAdmin ? 'text-white/80' : 'text-blue-600'
                }`}>
                  {client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil < 0
                    ? `${Math.abs(client.paymentInfo.daysUntil)} days overdue`
                    : client.paymentInfo.daysUntil === 0
                    ? 'Due today!'
                    : `${client.paymentInfo.daysUntil} days`
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`px-6 py-3 ${isAdmin ? 'bg-white/10 border-t border-white/20' : 'bg-gray-50 border-t border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>
            {client.goal && (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{client.goal}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onView(client.id)}
            className={`text-sm font-medium ${isAdmin ? 'text-white hover:text-white/80' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Bar Component (narrow full-width bars)
function AdminBar({ client, onView }: { client: any; onView: (id: string) => void }) {
  const isMihaela = client.email === 'info@mihaelafitness.com' || client.email === 'mihaela@mihaelafitness.com';
  const isChiel = client.email === 'chiel@media2net.nl';
  
  const adminBarColors = isMihaela 
    ? 'bg-gradient-to-r from-pink-500 to-rose-600 border-pink-300' 
    : isChiel
    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-300'
    : 'bg-gradient-to-r from-blue-500 to-purple-600';

  const expectedTotal = (client.subscriptionDuration && client.trainingFrequency)
    ? client.subscriptionDuration * client.trainingFrequency
    : (client.totalSessions || 0);
  const completed = client.completedSessions || 0;
  const percentage = expectedTotal > 0 ? Math.round((completed / expectedTotal) * 100) : 0;

  return (
    <div className={`group rounded-xl shadow-sm border-2 ${adminBarColors} hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      <div className="flex items-center justify-between p-4 text-white">
        {/* Left side - Avatar & Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            {client.profilePicture ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                <img 
                  src={client.profilePicture} 
                  alt={client.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                {client.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-white/90 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-800">A</span>
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold truncate">{client.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 flex-shrink-0">
                ADMIN
              </span>
            </div>
            <p className="text-sm text-white/80 truncate">{client.email}</p>
          </div>
        </div>

        {/* Middle - Stats */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <div className="text-xl font-bold">{`${completed}/${expectedTotal}`}</div>
            <div className="text-xs text-white/80">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{client.trainingFrequency || 0}</div>
            <div className="text-xs text-white/80">Per Week</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{client.measurementsCount || 0}</div>
            <div className="text-xs text-white/80">Measurements</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{client.photosCount || 0}</div>
            <div className="text-xs text-white/80">Photos</div>
          </div>
          {/* Next Payment Info */}
          {client.paymentInfo && client.paymentInfo.nextPaymentDate && !client.paymentInfo.isPaid && (
            <div className={`text-center px-3 py-2 rounded-lg ${
              client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil < 0
                ? 'bg-red-500/30'
                : client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil <= 7
                ? 'bg-orange-500/30'
                : 'bg-white/10'
            }`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Euro className="w-4 h-4" />
                <div className="text-lg font-bold">{client.paymentInfo.amount} RON</div>
              </div>
              <div className="text-xs text-white/90">
                {client.paymentInfo.daysUntil !== null && client.paymentInfo.daysUntil < 0
                  ? `${Math.abs(client.paymentInfo.daysUntil)} days overdue`
                  : client.paymentInfo.daysUntil === 0
                  ? 'Due today!'
                  : `${client.paymentInfo.daysUntil} days`
                }
              </div>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {client.phone && (
            <div className="hidden lg:flex items-center gap-1 text-sm text-white/80">
              <Phone className="w-4 h-4" />
              <span>{client.phone}</span>
            </div>
          )}
          <button
            onClick={() => onView(client.id)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title="View Client"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onView(client.id)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 border border-white/30"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}

// Stats Cards Component
function StatsCard({ title, value, icon: Icon, color, trend }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}

export default function ClientsV2Page() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      // Use richer overview endpoint that includes sessions and photos counts
      const response = await fetch('/api/clients/overview');
      if (response.ok) {
        const data = await response.json();
        const clientsData = data.clients || data.users || [];
        
        // Fetch payment data for all clients
        const clientsWithPayments = await Promise.all(
          clientsData.map(async (client: any) => {
            try {
              // Get payments
              const paymentsResponse = await fetch(`/api/payments?customerId=${client.id}`);
              const payments = paymentsResponse.ok ? await paymentsResponse.json() : [];
              
              // Calculate payment amount with better fallback logic
              let paymentAmount = 0;
              
              // Strategy 1: Use last payment amount if available and > 0
              if (payments.length > 0) {
                const sortedPayments = [...payments].sort((a, b) => 
                  new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime()
                );
                const lastPayment = sortedPayments[0];
                if (lastPayment.amount && lastPayment.amount > 0) {
                  paymentAmount = lastPayment.amount;
                }
              }
              
              // Strategy 2: If no valid last payment, use average of all payments with amount > 0
              if (paymentAmount === 0 && payments.length > 0) {
                const validPayments = payments.filter((p: any) => p.amount && p.amount > 0);
                if (validPayments.length > 0) {
                  paymentAmount = Math.round(validPayments.reduce((sum: number, p: any) => sum + p.amount, 0) / validPayments.length);
                }
              }
              
              // Strategy 3: If still no amount, get from pricing calculations
              if (paymentAmount === 0) {
                try {
                  const pricingResponse = await fetch(`/api/pricing-calculations?customerId=${client.id}`);
                  if (pricingResponse.ok) {
                    const pricingData = await pricingResponse.json();
                    if (pricingData && pricingData.length > 0) {
                      // Get the most recent pricing calculation
                      const sortedPricing = [...pricingData].sort((a: any, b: any) => 
                        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                      );
                      const mostRecentPricing = sortedPricing[0];
                      
                      if (mostRecentPricing.finalPrice && mostRecentPricing.finalPrice > 0) {
                        // Calculate monthly payment: total price / (duration in weeks / 4 weeks per month)
                        // Or if duration is in months, use that directly
                        const duration = mostRecentPricing.duration || 12; // Default to 12 weeks
                        const frequency = mostRecentPricing.frequency || 3; // Default to 3x per week
                        
                        // If duration is in weeks, calculate monthly: (finalPrice / duration) * 4 weeks
                        // But if we have subscription, it's usually: finalPrice / (duration in weeks / 4)
                        // Let's use: finalPrice divided by number of months in subscription
                        const monthsInSubscription = Math.max(1, Math.ceil(duration / 4)); // Convert weeks to months (roughly)
                        paymentAmount = Math.round(mostRecentPricing.finalPrice / monthsInSubscription);
                        
                        // If that gives us 0 or too low, try direct calculation
                        if (paymentAmount === 0 || paymentAmount < 50) {
                          // Alternative: assume 4 weeks per payment period
                          paymentAmount = Math.round(mostRecentPricing.finalPrice / 4);
                        }
                      }
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching pricing for client ${client.id}:`, error);
                }
              }
              
              // Calculate next payment
              let nextPaymentDate = '';
              let isPaid = false;
              let daysUntil = null;
              
              if (payments.length > 0) {
                const sortedPayments = [...payments].sort((a, b) => 
                  new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime()
                );
                const lastPayment = sortedPayments[0];
                const lastPaymentDate = new Date(lastPayment.paymentDate || lastPayment.createdAt);
                
                // If paymentAmount is still 0, try to use lastPayment amount
                if (paymentAmount === 0 && lastPayment.amount && lastPayment.amount > 0) {
                  paymentAmount = lastPayment.amount;
                }
                
                // Calculate next payment date (4 weeks = 28 days)
                const nextPayment = new Date(lastPaymentDate);
                nextPayment.setDate(nextPayment.getDate() + 28);
                
                // Check if paid
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const nextPaymentNormalized = new Date(nextPayment);
                nextPaymentNormalized.setHours(0, 0, 0, 0);
                
                isPaid = payments.some(p => {
                  const paymentDate = new Date(p.paymentDate || p.createdAt);
                  paymentDate.setHours(0, 0, 0, 0);
                  return paymentDate >= nextPaymentNormalized;
                });
                
                nextPaymentDate = nextPayment.toISOString().split('T')[0];
                daysUntil = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              } else if (paymentAmount > 0) {
                // No payments yet, but we have pricing info - calculate next payment from join date
                const joinDate = new Date(client.joinDate || new Date());
                const nextPayment = new Date(joinDate);
                nextPayment.setDate(nextPayment.getDate() + 28);
                nextPaymentDate = nextPayment.toISOString().split('T')[0];
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                daysUntil = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              }
              
              return {
                ...client,
                paymentInfo: {
                  isPaid,
                  nextPaymentDate,
                  amount: paymentAmount || 0,
                  daysUntil
                }
              };
            } catch (error) {
              console.error(`Error loading payment for client ${client.id}:`, error);
              return {
                ...client,
                paymentInfo: {
                  isPaid: false,
                  nextPaymentDate: '',
                  amount: 0,
                  daysUntil: null
                }
              };
            }
          })
        );
        
        setClients(clientsWithPayments);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (client: {id: string, name: string}) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    try {
      const response = await fetch(`/api/users/${clientToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadClients();
        setShowDeleteModal(false);
        setClientToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  // Separate admin users and regular clients
  const adminUsers = clients.filter(client => 
    client.email === 'info@mihaelafitness.com' || 
    client.email === 'mihaela@mihaelafitness.com' || 
    client.email === 'chiel@media2net.nl'
  );
  
  const regularClients = clients.filter(client => 
    client.email !== 'info@mihaelafitness.com' && 
    client.email !== 'mihaela@mihaelafitness.com' && 
    client.email !== 'chiel@media2net.nl'
  );

  const filteredClients = regularClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    intake: clients.filter(c => c.status === 'intake').length,
    totalSessions: clients.reduce((sum, c) => sum + (c.totalSessions || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600 mt-1">Manage your fitness clients</p>
            </div>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Clients"
              value={stats.total}
              icon={Users}
              color="bg-blue-500"
              trend="+12%"
            />
            <StatsCard
              title="Active Clients"
              value={stats.active}
              icon={CheckCircle}
              color="bg-emerald-500"
              trend="+8%"
            />
            <StatsCard
              title="Intake Process"
              value={stats.intake}
              icon={Clock}
              color="bg-amber-500"
            />
            <StatsCard
              title="Total Sessions"
              value={stats.totalSessions}
              icon={Dumbbell}
              color="bg-purple-500"
              trend="+15%"
            />
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading clients...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Admin Bars - Always at the top */}
            {adminUsers.length > 0 && (
              <div className="space-y-3 mb-8">
                {adminUsers
                  .sort((a, b) => {
                    // Sort: Mihaela first, then Chiel
                    const aIsMihaela = a.email === 'info@mihaelafitness.com' || a.email === 'mihaela@mihaelafitness.com';
                    const bIsMihaela = b.email === 'info@mihaelafitness.com' || b.email === 'mihaela@mihaelafitness.com';
                    if (aIsMihaela && !bIsMihaela) return -1;
                    if (!aIsMihaela && bIsMihaela) return 1;
                    return 0;
                  })
                  .map((admin) => (
                    <AdminBar
                      key={admin.id}
                      client={admin}
                      onView={(id) => router.push(`/admin/v2/clients/${id}`)}
                    />
                  ))}
              </div>
            )}

            {/* Regular Clients Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onView={(id) => router.push(`/admin/v2/clients/${id}`)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </>
        )}

        {!loading && filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
            </p>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Add Client
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Client</h3>
                <p className="text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{clientToDelete.name}</strong>? 
              All their data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
