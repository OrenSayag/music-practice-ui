import type { LucideIcon } from 'lucide-react';
import { Home, Music, Mic } from 'lucide-react';

export interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    titleKey: 'nav.home',
    href: '/',
    icon: Home,
  },
  {
    titleKey: 'nav.practice',
    href: '/practice',
    icon: Music,
  },
  {
    titleKey: 'nav.recordings',
    href: '/recordings',
    icon: Mic,
  },
];
