'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Eye, EyeOff, KeyRound, Loader2, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthToken } from '@/hooks/useOnlineApi';
import { adminCardStyle, adminInputClassName } from '@/lib/adminStyles';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  status: string;
  loginPassword: string | null;
  hasPassword: boolean;
  createdAt: string;
};

export default function AdminUserTableClient() {
  const { t } = useLanguage();
  const ut = t.admin.userTable;
  const token = useAuthToken();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPasswords, setShowPasswords] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/admin/user-table${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('load failed');
      const json = await res.json();
      setUsers(json.users || []);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, token]);

  useEffect(() => {
    const tmr = setTimeout(() => load(), search ? 300 : 0);
    return () => clearTimeout(tmr);
  }, [load, search]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error(e);
    }
  };

  const savePassword = async (userId: string) => {
    if (!newPassword.trim() || newPassword.length < 4) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/user-table', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify({ userId, password: newPassword }),
      });
      if (!res.ok) throw new Error('save failed');
      setEditingId(null);
      setNewPassword('');
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const displayPassword = (row: UserRow) => {
    if (!row.loginPassword) {
      return row.hasPassword ? ut.passwordHashed : ut.noPassword;
    }
    return showPasswords ? row.loginPassword : '••••••••';
  };

  const stats = useMemo(
    () => ({
      total: users.length,
      withLogin: users.filter((u) => u.loginPassword || u.hasPassword).length,
    }),
    [users],
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 hidden lg:block">
        <h1 className="text-2xl font-bold text-white">{ut.title}</h1>
        <p className="mt-1 text-sm text-white/55">{ut.subtitle}</p>
      </div>

      <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
        {ut.securityNote}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ut.searchPlaceholder}
            className={`${adminInputClassName} w-full pl-10`}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10"
        >
          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPasswords ? ut.hidePasswords : ut.showPasswords}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:max-w-md">
        <div className="rounded-2xl border p-3" style={adminCardStyle}>
          <p className="text-xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-white/55">{ut.totalUsers}</p>
        </div>
        <div className="rounded-2xl border p-3" style={adminCardStyle}>
          <p className="text-xl font-bold text-emerald-300">{stats.withLogin}</p>
          <p className="text-xs text-white/55">{ut.withCredentials}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border" style={adminCardStyle}>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
          </div>
        ) : users.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/50">{ut.noUsers}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/45">
                  <th className="px-4 py-3 font-medium">{ut.colName}</th>
                  <th className="px-4 py-3 font-medium">{ut.colLogin}</th>
                  <th className="px-4 py-3 font-medium">{ut.colPassword}</th>
                  <th className="px-4 py-3 font-medium">{ut.colRole}</th>
                  <th className="px-4 py-3 font-medium">{ut.colPlan}</th>
                  <th className="px-4 py-3 font-medium">{ut.colStatus}</th>
                  <th className="px-4 py-3 font-medium">{ut.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-white/85">{row.email}</span>
                        <button
                          type="button"
                          onClick={() => copyText(row.email)}
                          className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                          title={ut.copy}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-white/75">
                      {editingId === row.id ? (
                        <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={ut.newPasswordPlaceholder}
                          className={`${adminInputClassName} w-full min-w-[140px] font-sans`}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <span>{displayPassword(row)}</span>
                          {row.loginPassword && (
                            <button
                              type="button"
                              onClick={() => copyText(row.loginPassword!)}
                              className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                              title={ut.copy}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-white/70">{row.role}</td>
                    <td className="px-4 py-3 text-white/70">{row.plan}</td>
                    <td className="px-4 py-3 capitalize text-white/70">{row.status}</td>
                    <td className="px-4 py-3">
                      {editingId === row.id ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={saving || newPassword.length < 4}
                            onClick={() => savePassword(row.id)}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {saving ? '…' : ut.save}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setNewPassword('');
                            }}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70"
                          >
                            {ut.cancel}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(row.id);
                            setNewPassword(row.loginPassword || '');
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          {ut.setPassword}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
