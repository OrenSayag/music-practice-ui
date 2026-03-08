import { useAuthUser } from '@/layouts/authenticated-layout';
import { NAV_ITEMS } from '@/config/nav';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useDir } from '@/hooks/use-dir';

export function AppSidebar() {
  const { user } = useAuthUser();
  const { t } = useTranslation();
  const location = useLocation();
  const dir = useDir()

  return (
    <Sidebar side={
            dir === "rtl" ? "right" : "left"
        }>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default">
              <div className="flex flex-col gap-0.5 leading-none grow">
                <span className="font-bold">{`${user.firstName ?? ''} ${user.lastName ?? ''}`}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
                    tooltip={t(item.titleKey)}
                  >
                    <Link to={item.href}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
