import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';

export interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    titleKey: 'nav.dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
];
