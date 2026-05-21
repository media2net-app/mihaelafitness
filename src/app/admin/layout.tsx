import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import AdminPageShell from '@/components/admin/AdminPageShell';

export const metadata = {
  title: 'Admin | Mihaela Fitness',
  description: 'Admin dashboard',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRouteGuard>
      <AdminPageShell>{children}</AdminPageShell>
    </AdminRouteGuard>
  );
}
