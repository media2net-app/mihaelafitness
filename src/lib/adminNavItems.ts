import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Calculator,
  Calendar,
  CheckSquare,
  ChefHat,
  Database,
  DollarSign,
  Dumbbell,
  FileEdit,
  FileText,
  MapPin,
  Ruler,
  Scale,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  Users2,
  UtensilsCrossed,
} from 'lucide-react';

export type AdminNavItem = {
  path: string;
  icon: LucideIcon;
  label: string;
  highlighted?: boolean;
};

type AdminNavTranslations = {
  admin: {
    dashboard: {
      title: string;
      clients: string;
      schedule: string;
      trainingSchedules: string;
      exerciseLibrary: string;
      nutritionPlans: string;
      ingredients: string;
      measurements: string;
      pricingCalculator: string;
    };
  };
};

export function getAdminNavItems(t: AdminNavTranslations): AdminNavItem[] {
  return [
    { path: '/admin/plan-2026', icon: Sparkles, label: 'Plan 2026', highlighted: true },
    { path: '/admin', icon: Shield, label: t.admin.dashboard.title },
    { path: '/admin/clients', icon: Users, label: t.admin.dashboard.clients },
    { path: '/admin/groups', icon: Users2, label: 'Groups' },
    { path: '/admin/intakes', icon: UserPlus, label: 'Intakes' },
    { path: '/admin/online-coaching', icon: Users, label: 'Online Coaching' },
    { path: '/admin/food-tracking', icon: UtensilsCrossed, label: 'Food Tracking' },
    { path: '/admin/user-table', icon: Users, label: 'User Table' },
    { path: '/admin/schedule', icon: Calendar, label: t.admin.dashboard.schedule },
    { path: '/admin/to-do', icon: CheckSquare, label: 'To-Do List' },
    { path: '/admin/trainingschemas', icon: Target, label: t.admin.dashboard.trainingSchedules },
    { path: '/admin/v2/exercise-library', icon: Dumbbell, label: t.admin.dashboard.exerciseLibrary },
    { path: '/admin/voedingsplannen', icon: BookOpen, label: t.admin.dashboard.nutritionPlans },
    { path: '/admin/ingredienten', icon: BookOpen, label: t.admin.dashboard.ingredients },
    { path: '/admin/ingredienten-v2', icon: Scale, label: 'Ingredienten V2' },
    { path: '/admin/mealplan-mapping', icon: MapPin, label: 'Mealplan Mapping' },
    { path: '/admin/recepten', icon: ChefHat, label: 'Rețete' },
    { path: '/admin/voedingsplannen-api', icon: Database, label: 'API Planuri Nutriționale' },
    { path: '/admin/kcal-calculator-v2', icon: Calculator, label: 'KCAL Calculator V2' },
    { path: '/admin/nutrition-calculations', icon: FileText, label: 'Nutrition Calculations' },
    { path: '/admin/measurements', icon: Ruler, label: t.admin.dashboard.measurements },
    { path: '/admin/pdf-template-builder', icon: FileEdit, label: 'PDF Template Builder' },
    { path: '/admin/tarieven', icon: Settings, label: t.admin.dashboard.pricingCalculator },
    { path: '/admin/payments', icon: DollarSign, label: 'Payments' },
    { path: '/admin/invoices', icon: FileText, label: 'Facturi' },
    { path: '/admin/ig-winner', icon: Trophy, label: 'IG Winner' },
  ];
}
