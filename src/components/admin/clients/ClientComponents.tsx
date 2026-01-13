'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Euro,
  Eye,
  Phone,
  Star,
  Trash2,
  Target,
  User as UserIcon,
} from 'lucide-react';
import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type ClientOverview = {
  id: string;
  name: string;
  email: string;
  status?: string;
  profilePicture?: string | null;
  groupName?: string | null;
  rating?: number | null;
  trainingFrequency?: number | null;
  totalSessions?: number | null;
  completedSessions?: number | null;
  measurementsCount?: number | null;
  photosCount?: number | null;
  subscriptionDuration?: number | null;
  joinDate?: string | Date | null;
  phone?: string | null;
  goal?: string | null;
  paymentInfo?: {
    isPaid?: boolean;
    nextPaymentDate?: string;
    amount?: number;
    daysUntil?: number | null;
  };
  [key: string]: any;
};

type ClientCardProps = {
  client: ClientOverview;
  onView: (id: string) => void;
  onDelete?: (client: { id: string; name: string }) => void;
  onAcceptIntake?: (id: string) => void;
  actionLabel?: ReactNode;
};

type AdminBarProps = {
  client: ClientOverview;
  onView: (id: string) => void;
};

const ADMIN_EMAILS = new Set([
  'info@mihaelafitness.com',
  'mihaela@mihaelafitness.com',
  'chiel@media2net.nl',
]);

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'intake':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return <CheckCircle className="w-3 h-3" />;
    case 'inactive':
      return <AlertCircle className="w-3 h-3" />;
    case 'intake':
      return <Clock className="w-3 h-3" />;
    default:
      return <UserIcon className="w-3 h-3" />;
  }
};

const getAdminCardColors = (client: ClientOverview) => {
  const email = client.email?.toLowerCase() ?? '';
  if (email === 'info@mihaelafitness.com' || email === 'mihaela@mihaelafitness.com') {
    return 'bg-gradient-to-br from-pink-500 to-rose-600 border-pink-300';
  }
  if (email === 'chiel@media2net.nl') {
    return 'bg-gradient-to-br from-blue-500 to-cyan-600 border-blue-300';
  }
  return 'bg-gradient-to-br from-blue-500 to-purple-600';
};

const formatJoinDate = (value?: string | Date | null) => {
  if (!value) {
    return '—';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString();
};

export function ClientCard({
  client,
  onView,
  onDelete,
  onAcceptIntake,
  actionLabel,
}: ClientCardProps) {
  const { t } = useLanguage();
  const clientsText = t.admin.clientsPage;
  const status = (client.status || '').toLowerCase();
  const isAdmin = ADMIN_EMAILS.has(client.email?.toLowerCase?.() ?? '');
  const initials =
    client.name
      ?.split(' ')
      .map((part: string) => part[0])
      .join('')
      .slice(0, 2) || 'MF';

  const expectedTotal =
    client.subscriptionDuration && client.trainingFrequency
      ? client.subscriptionDuration * client.trainingFrequency
      : client.totalSessions || 0;
  const completed = client.completedSessions || 0;
  const percentage = expectedTotal > 0 ? Math.round((completed / expectedTotal) * 100) : 0;
  const remaining = expectedTotal - completed;
  const weeksRemaining =
    client.trainingFrequency && client.trainingFrequency > 0
      ? Math.ceil(remaining / client.trainingFrequency)
      : 0;

  const photosCount = client.photosCount || 0;
  const measurementsCount = client.measurementsCount || 0;
  const expectedPhotos = measurementsCount * 3;
  const isMissingPhotos = photosCount < expectedPhotos;

  const paymentInfo = client.paymentInfo || {};

  const showAcceptAction = !isAdmin && onAcceptIntake && status === 'intake';

  const formatPaymentDays = (days: number | null | undefined) => {
    if (days === null || days === undefined) return '—';
    if (days < 0) {
      return clientsText.payment.overdue.replace('{count}', String(Math.abs(days)));
    }
    if (days === 0) {
      return clientsText.payment.dueToday;
    }
    return clientsText.payment.inDays.replace('{count}', String(days));
  };

  const missingPhotosText = clientsText.missingPhotos.replace(
    '{count}',
    String(expectedPhotos - photosCount),
  );

  const paymentDays = paymentInfo.daysUntil;
  const hasPaymentDate = Boolean(paymentInfo.nextPaymentDate);
  const nextPaymentDateLabel = hasPaymentDate
    ? clientsText.payment.dateLabel.replace(
        '{date}',
        new Date(paymentInfo.nextPaymentDate!).toLocaleDateString(),
      )
    : null;

  const isOverdue = paymentDays !== null && paymentDays !== undefined && paymentDays < 0;
  const isDueSoon = paymentDays !== null && paymentDays !== undefined && paymentDays <= 7;

  const amountColorClass = isOverdue
    ? isAdmin
      ? 'text-white'
      : 'text-red-700'
    : isDueSoon
    ? isAdmin
      ? 'text-white'
      : 'text-orange-700'
    : isAdmin
    ? 'text-white'
    : 'text-rose-700';

  const supportingColorClass = isOverdue
    ? isAdmin
      ? 'text-white/90'
      : 'text-red-600'
    : isDueSoon
    ? isAdmin
      ? 'text-white/90'
      : 'text-orange-600'
    : isAdmin
    ? 'text-white/80'
    : 'text-rose-600';

  return (
    <div
      className={`group rounded-2xl shadow-sm border-2 ${
        isAdmin ? getAdminCardColors(client) : 'bg-white border-gray-100'
      } hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden`}
    >
      <div className={`p-6 pb-4 ${isAdmin ? 'text-white' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-14 h-14 ${
                  isAdmin
                    ? 'bg-white/20 backdrop-blur-sm border-2 border-white/30'
                    : 'bg-gradient-to-br from-rose-500 to-pink-500 text-white'
                } rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg`}
              >
                {initials}
              </div>
              {isAdmin ? (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-white/90 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">A</span>
                </div>
              ) : (
                status && (
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${getStatusColor(
                      status,
                    )}`}
                  >
                    {getStatusIcon(status)}
                  </div>
                )
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-semibold ${isAdmin ? 'text-white' : 'text-gray-900'} truncate`}>
                  {client.name}
                </h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                    {clientsText.adminLabel}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isAdmin ? 'text-white/80' : 'text-gray-500'} truncate`}>
                {client.email}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {!isAdmin && status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                    {client.status}
                  </span>
                )}
                {client.groupName && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isAdmin
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {client.groupName}
                  </span>
                )}
                {client.rating && (
                  <div className="flex items-center gap-1">
                    <Star className={`w-3 h-3 ${isAdmin ? 'text-yellow-200' : 'text-yellow-400'} fill-current`} />
                    <span className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-600'}`}>
                      {client.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(client.id)}
              className={`p-2 ${
                isAdmin ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
              } rounded-xl transition-colors`}
              title={clientsText.actions.viewClient}
            >
              <Eye className="w-4 h-4" />
            </button>
            {!isAdmin && onDelete && (
              <button
                onClick={() => onDelete({ id: client.id, name: client.name })}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title={clientsText.actions.deleteClient}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className={`text-center ${isAdmin ? 'text-white' : ''}`}>
            <div className={`text-xl font-bold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
              {`${completed}/${expectedTotal}`}
            </div>
            <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'} mb-1`}>{clientsText.statsSessions}</div>
            {expectedTotal > 0 && (
              <>
                <div className={`w-full ${isAdmin ? 'bg-white/20' : 'bg-gray-200'} rounded-full h-1.5 mb-1`}>
                  <div
                    className={`${isAdmin ? 'bg-white' : 'bg-rose-500'} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>
                  {percentage}% • {weeksRemaining}
                  {clientsText.weeksShort}
                </div>
              </>
            )}
          </div>
          <div className={`text-center ${isAdmin ? 'text-white' : ''}`}>
            <div className={`text-xl font-bold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
              {client.trainingFrequency || 0}
            </div>
            <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>{clientsText.statsPerWeek}</div>
          </div>
          <div className={`text-center ${isAdmin ? 'text-white' : ''}`}>
            <div className={`text-xl font-bold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
              {client.measurementsCount || 0}
            </div>
            <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>{clientsText.statsMeasurements}</div>
          </div>
          <div className={`text-center ${isAdmin ? 'text-white' : ''}`}>
            <div
              className={`text-xl font-bold ${
                isMissingPhotos ? 'text-red-500' : isAdmin ? 'text-white' : 'text-gray-900'
              }`}
            >
              {photosCount}
            </div>
            <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>{clientsText.statsPhotos}</div>
            {isMissingPhotos && expectedPhotos > 0 && (
              <div className={`text-xs ${isAdmin ? 'text-white/90' : 'text-red-500'} mt-1`}>
                {missingPhotosText}
              </div>
            )}
          </div>
        </div>

        <div className={`space-y-2 text-sm ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {clientsText.joinedLabel} {formatJoinDate(client.joinDate)}
              </span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
            )}
          </div>

          {paymentInfo.nextPaymentDate && !paymentInfo.isPaid && (
            <div
              className={`flex items-center justify-between p-2 rounded-lg ${
                paymentInfo.daysUntil !== null && paymentInfo.daysUntil !== undefined && paymentInfo.daysUntil < 0
                  ? isAdmin
                    ? 'bg-red-500/30'
                    : 'bg-red-50 border border-red-200'
                  : paymentInfo.daysUntil !== null &&
                    paymentInfo.daysUntil !== undefined &&
                    paymentInfo.daysUntil <= 7
                  ? isAdmin
                    ? 'bg-orange-500/30'
                    : 'bg-orange-50 border border-orange-200'
                  : isAdmin
                  ? 'bg-white/10'
                  : 'bg-rose-50 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Euro
                  className={`w-4 h-4 ${
                    paymentInfo.daysUntil !== null && paymentInfo.daysUntil !== undefined && paymentInfo.daysUntil < 0
                      ? isAdmin
                        ? 'text-white'
                        : 'text-red-600'
                      : paymentInfo.daysUntil !== null &&
                        paymentInfo.daysUntil !== undefined &&
                        paymentInfo.daysUntil <= 7
                      ? isAdmin
                        ? 'text-white'
                        : 'text-orange-600'
                      : isAdmin
                      ? 'text-white/80'
                      : 'text-rose-600'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    paymentInfo.daysUntil !== null && paymentInfo.daysUntil !== undefined && paymentInfo.daysUntil < 0
                      ? isAdmin
                        ? 'text-white'
                        : 'text-red-800'
                      : paymentInfo.daysUntil !== null &&
                        paymentInfo.daysUntil !== undefined &&
                        paymentInfo.daysUntil <= 7
                      ? isAdmin
                        ? 'text-white'
                        : 'text-orange-800'
                      : isAdmin
                      ? 'text-white/90'
                      : 'text-rose-800'
                  }`}
                >
                  {clientsText.payment.nextPayment}
                </span>
              </div>
              <div className="text-right">
                {nextPaymentDateLabel && (
                  <div className={`text-xs font-medium ${supportingColorClass}`}>
                    {nextPaymentDateLabel}
                  </div>
                )}
                <div
                  className={`text-xs font-bold ${amountColorClass}`}
                >
                  {paymentInfo.amount ? `${paymentInfo.amount} RON` : '-'}
                </div>
                <div
                  className={`text-xs ${supportingColorClass}`}
                >
                  {formatPaymentDays(paymentInfo.daysUntil)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`px-6 py-3 ${
          isAdmin ? 'bg-white/10 border-t border-white/20' : 'bg-rose-50/60 border-t border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className={`text-xs ${isAdmin ? 'text-white/80' : 'text-gray-500'}`}>
            {client.goal && (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{client.goal}</span>
              </div>
            )}
          </div>
          {showAcceptAction ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAcceptIntake(client.id)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                {clientsText.actions.activateClient}
              </button>
              <button
                onClick={() => onView(client.id)}
                className={`text-sm font-medium ${isAdmin ? 'text-white hover:text-white/80' : 'text-rose-600 hover:text-rose-700'} transition-colors`}
              >
                {clientsText.actions.viewDetails}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onView(client.id)}
              className={`text-sm font-medium ${isAdmin ? 'text-white hover:text-white/80' : 'text-rose-600 hover:text-rose-700'} transition-colors`}
            >
              {actionLabel || clientsText.actions.viewDetails}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminBar({ client, onView }: AdminBarProps) {
  const { t } = useLanguage();
  const clientsText = t.admin.clientsPage;
  const email = client.email?.toLowerCase() ?? '';
  const adminBarColors =
    email === 'info@mihaelafitness.com' || email === 'mihaela@mihaelafitness.com'
      ? 'bg-gradient-to-r from-pink-500 to-rose-600 border-pink-300'
      : email === 'chiel@media2net.nl'
      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-300'
      : 'bg-gradient-to-r from-blue-500 to-purple-600';

  const expectedTotal =
    client.subscriptionDuration && client.trainingFrequency
      ? client.subscriptionDuration * client.trainingFrequency
      : client.totalSessions || 0;
  const completed = client.completedSessions || 0;
  const nextPaymentLabel = client.paymentInfo?.nextPaymentDate
    ? clientsText.payment.dateLabel.replace(
        '{date}',
        new Date(client.paymentInfo.nextPaymentDate).toLocaleDateString(),
      )
    : null;

  return (
    <div className={`group rounded-xl shadow-sm border-2 ${adminBarColors} hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
              {client.name
                ?.split(' ')
                .map((part: string) => part[0])
                .join('')
                .slice(0, 2) || 'MF'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-white/90 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-800">A</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold truncate">{client.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 flex-shrink-0">
                {clientsText.adminLabel}
              </span>
            </div>
            <p className="text-sm text-white/80 truncate">{client.email}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <div className="text-xl font-bold">{`${completed}/${expectedTotal}`}</div>
            <div className="text-xs text-white/80">{clientsText.statsSessions}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{client.trainingFrequency || 0}</div>
            <div className="text-xs text-white/80">{clientsText.statsPerWeek}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{client.measurementsCount || 0}</div>
            <div className="text-xs text-white/80">{clientsText.statsMeasurements}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{client.photosCount || 0}</div>
            <div className="text-xs text-white/80">{clientsText.statsPhotos}</div>
          </div>
          {client.paymentInfo && client.paymentInfo.amount ? (
            <div className="text-center px-3 py-2 rounded-lg bg-white/10">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Euro className="w-4 h-4" />
                <div className="text-lg font-bold">{client.paymentInfo.amount} RON</div>
              </div>
              <div className="text-xs text-white/90">
                {nextPaymentLabel || '—'}
              </div>
            </div>
          ) : null}
        </div>

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
            title={clientsText.actions.viewClient}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onView(client.id)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 border border-white/30"
          >
            {clientsText.actions.viewDetails}
          </button>
        </div>
      </div>
    </div>
  );
}
