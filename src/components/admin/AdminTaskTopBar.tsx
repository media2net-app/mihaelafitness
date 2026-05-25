'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Camera, Calendar, ChevronRight } from 'lucide-react';
import AdminAlertsModal, { type AdminAlertsData } from './AdminAlertsModal';

const emptyAlerts: AdminAlertsData = {
  totalCount: 0,
  missingPhotos: { clientCount: 0, totalMissing: 0, clients: [] },
  overdueSessions: { count: 0, sessions: [] },
};

export default function AdminTaskTopBar() {
  const [alerts, setAlerts] = useState<AdminAlertsData>(emptyAlerts);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/alerts', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load alerts');
      const data = await response.json();
      setAlerts(data);
      if (data.totalCount === 0) setModalOpen(false);
    } catch (error) {
      console.error('Error loading admin alerts:', error);
      setAlerts(emptyAlerts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const intervalId = setInterval(loadAlerts, 60000);
    const handleFocus = () => loadAlerts();
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadAlerts();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadAlerts]);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  if (loading || alerts.totalCount === 0) {
    return null;
  }

  const photoLabel =
    alerts.missingPhotos.clientCount === 1
      ? `1 client · ${alerts.missingPhotos.totalMissing} photo(s)`
      : `${alerts.missingPhotos.clientCount} clients · ${alerts.missingPhotos.totalMissing} photo(s)`;

  const sessionLabel =
    alerts.overdueSessions.count === 1
      ? '1 overdue session'
      : `${alerts.overdueSessions.count} overdue sessions`;

  const openModal = () => setModalOpen(true);

  return (
    <>
      <div
        className="sticky top-0 z-50 w-full shrink-0 border-b backdrop-blur-md"
        style={{
          borderColor: 'rgba(245, 158, 11, 0.35)',
          background: 'rgba(120, 53, 15, 0.96)',
        }}
      >
        <div className="px-3 py-2.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={openModal}
            className="flex w-full flex-col gap-2 text-left transition-opacity hover:opacity-95 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">
                  Open admin tasks
                </p>
                <div className="mt-1 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                  {alerts.missingPhotos.clientCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-50">
                      <Camera className="h-3.5 w-3.5 shrink-0" />
                      {photoLabel}
                    </span>
                  )}
                  {alerts.overdueSessions.count > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-50">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {sessionLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-amber-100/90 sm:text-sm">
              Tap to resolve
              <ChevronRight className="h-4 w-4 opacity-80" />
            </span>
          </button>
        </div>
      </div>

      <AdminAlertsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        alerts={alerts}
        onAlertsChange={setAlerts}
        onRefresh={loadAlerts}
      />
    </>
  );
}
