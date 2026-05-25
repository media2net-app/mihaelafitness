'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  X,
  XCircle,
  UserX,
} from 'lucide-react';
import { ADMIN_ALERT_TYPES } from '@/lib/adminAlerts';
import {
  adminCardStyle,
  adminGhostBtnClassName,
  adminPrimaryBtnClassName,
} from '@/lib/adminStyles';

const actionBtnClassName =
  'min-h-11 w-full justify-center gap-2 text-sm sm:min-h-10';

export type AdminAlertsData = {
  totalCount: number;
  missingPhotos: {
    clientCount: number;
    totalMissing: number;
    clients: Array<{ id: string; name: string; missingCount: number }>;
  };
  overdueSessions: {
    count: number;
    sessions: Array<{
      id: string;
      customerId: string | null;
      customerName: string;
      date: string;
      startTime: string;
      endTime: string;
    }>;
  };
};

type AdminAlertsModalProps = {
  open: boolean;
  onClose: () => void;
  alerts: AdminAlertsData;
  onAlertsChange: (alerts: AdminAlertsData) => void;
  onRefresh: () => Promise<void>;
};

function formatSessionDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
}

export default function AdminAlertsModal({
  open,
  onClose,
  alerts,
  onAlertsChange,
  onRefresh,
}: AdminAlertsModalProps) {
  const router = useRouter();
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
  const [dismissingKey, setDismissingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const dismissAlert = async (alertType: string, targetId: string) => {
    const key = `${alertType}:${targetId}`;
    setDismissingKey(key);
    setError(null);
    try {
      const response = await fetch('/api/admin/alerts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertType, targetId }),
      });
      if (!response.ok) throw new Error('Failed to dismiss alert');

      let nextAlerts = alerts;

      if (alertType === ADMIN_ALERT_TYPES.MISSING_PHOTOS) {
        const client = alerts.missingPhotos.clients.find((c) => c.id === targetId);
        const nextClients = alerts.missingPhotos.clients.filter((c) => c.id !== targetId);
        const removedMissing = client?.missingCount ?? 0;
        nextAlerts = {
          ...alerts,
          totalCount: Math.max(0, alerts.totalCount - 1),
          missingPhotos: {
            clientCount: nextClients.length,
            totalMissing: Math.max(0, alerts.missingPhotos.totalMissing - removedMissing),
            clients: nextClients,
          },
        };
      } else if (alertType === ADMIN_ALERT_TYPES.OVERDUE_SESSION) {
        const nextSessions = alerts.overdueSessions.sessions.filter((s) => s.id !== targetId);
        const removed = alerts.overdueSessions.sessions.length - nextSessions.length;
        nextAlerts = {
          ...alerts,
          totalCount: Math.max(0, alerts.totalCount - removed),
          overdueSessions: {
            count: nextSessions.length,
            sessions: nextSessions,
          },
        };
      }

      onAlertsChange(nextAlerts);
      if (nextAlerts.totalCount === 0) onClose();

      await onRefresh();
    } catch (e) {
      console.error(e);
      setError('Could not mark task as solved. Please try again.');
    } finally {
      setDismissingKey(null);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string) => {
    setUpdatingSessionId(sessionId);
    setError(null);
    try {
      const response = await fetch(`/api/training-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update session');

      const nextSessions = alerts.overdueSessions.sessions.filter((s) => s.id !== sessionId);
      const removed = alerts.overdueSessions.sessions.length - nextSessions.length;
      onAlertsChange({
        ...alerts,
        totalCount: Math.max(0, alerts.totalCount - removed),
        overdueSessions: {
          count: nextSessions.length,
          sessions: nextSessions,
        },
      });

      if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
        await onRefresh();
      }
    } catch (e) {
      console.error(e);
      setError('Could not update session. Please try again.');
    } finally {
      setUpdatingSessionId(null);
    }
  };

  const hasPhotos = alerts.missingPhotos.clients.length > 0;
  const hasSessions = alerts.overdueSessions.sessions.length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center sm:p-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-alerts-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 shadow-2xl sm:max-h-[min(90vh,720px)] sm:rounded-3xl"
        style={adminCardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex shrink-0 justify-center pt-3 sm:hidden"
          aria-hidden
        >
          <div className="h-1 w-10 rounded-full bg-white/30" />
        </div>

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 pr-2">
            <h2 id="admin-alerts-modal-title" className="text-base font-semibold text-white sm:text-lg">
              Open admin tasks
            </h2>
            <p className="mt-0.5 text-xs text-white/55 sm:text-sm">
              {alerts.totalCount} item{alerts.totalCount === 1 ? '' : 's'} need attention
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white active:bg-white/15"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 [-webkit-overflow-scrolling:touch] sm:px-5">
          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          {hasPhotos && (
            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4 text-amber-300" />
                <h3 className="text-sm font-semibold text-white">Missing progress photos</h3>
              </div>
              <ul className="space-y-2">
                {alerts.missingPhotos.clients.map((client) => {
                  const dismissKey = `${ADMIN_ALERT_TYPES.MISSING_PHOTOS}:${client.id}`;
                  const busy = dismissingKey === dismissKey;
                  return (
                    <li
                      key={client.id}
                      className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{client.name}</p>
                        <p className="text-xs text-white/50">
                          {client.missingCount} photo{client.missingCount === 1 ? '' : 's'} missing
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          className={`${adminPrimaryBtnClassName} ${actionBtnClassName} sm:flex-1`}
                          onClick={() => {
                            onClose();
                            router.push(`/admin/clients/${client.id}`);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open client
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            dismissAlert(ADMIN_ALERT_TYPES.MISSING_PHOTOS, client.id)
                          }
                          className={`${adminGhostBtnClassName} ${actionBtnClassName} border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10 sm:flex-1`}
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Solved
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {hasSessions && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-300" />
                <h3 className="text-sm font-semibold text-white">Sessions still scheduled</h3>
              </div>
              <ul className="space-y-3">
                {alerts.overdueSessions.sessions.map((session) => {
                  const busy = updatingSessionId === session.id;
                  const dismissKey = `${ADMIN_ALERT_TYPES.OVERDUE_SESSION}:${session.id}`;
                  const dismissing = dismissingKey === dismissKey;
                  const anyBusy = busy || dismissing;
                  return (
                    <li
                      key={session.id}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                    >
                      <div className="mb-3 min-w-0">
                        <p className="font-medium text-white">{session.customerName}</p>
                        <p className="text-xs text-white/50">
                          {formatSessionDate(session.date)} · {session.startTime}–{session.endTime}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={anyBusy}
                          onClick={() => updateSessionStatus(session.id, 'completed')}
                          className={`${adminPrimaryBtnClassName} ${actionBtnClassName}`}
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Completed
                        </button>
                        <button
                          type="button"
                          disabled={anyBusy}
                          onClick={() => updateSessionStatus(session.id, 'cancelled')}
                          className={`${adminGhostBtnClassName} ${actionBtnClassName}`}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancelled
                        </button>
                        <button
                          type="button"
                          disabled={anyBusy}
                          onClick={() => updateSessionStatus(session.id, 'no-show')}
                          className={`${adminGhostBtnClassName} ${actionBtnClassName}`}
                        >
                          <UserX className="h-4 w-4" />
                          No-show
                        </button>
                        <button
                          type="button"
                          disabled={anyBusy}
                          onClick={() =>
                            dismissAlert(ADMIN_ALERT_TYPES.OVERDUE_SESSION, session.id)
                          }
                          className={`${adminGhostBtnClassName} ${actionBtnClassName} border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10`}
                        >
                          {dismissing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Solved
                        </button>
                      </div>
                      <Link
                        href="/admin/schedule"
                        onClick={onClose}
                        className="mt-3 inline-flex min-h-11 items-center py-2 text-sm font-medium text-white/55 transition-colors hover:text-white/80 active:text-white"
                      >
                        Open in schedule →
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {!hasPhotos && !hasSessions && (
            <p className="py-8 text-center text-sm text-white/50">All tasks are done.</p>
          )}
        </div>

        <div
          className="shrink-0 border-t border-white/10 px-4 py-3 sm:px-5 sm:py-4"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={onClose}
            className={`${adminGhostBtnClassName} min-h-12 w-full justify-center text-base sm:min-h-11 sm:text-sm`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
