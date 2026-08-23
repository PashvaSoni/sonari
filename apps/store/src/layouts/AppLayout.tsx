import type { ReactElement } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppShell,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  LineChart,
  Package,
  Settings,
  Toaster,
  Users,
  toast,
  type AppShellNavItem,
} from '@sonari/ui'

export function AppLayout(): ReactElement {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const navItems: AppShellNavItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname.startsWith('/dashboard'),
      onSelect: () => navigate('/dashboard'),
    },
    {
      key: 'bills',
      label: 'Bills',
      icon: FileText,
      active: pathname.startsWith('/bills'),
      onSelect: () => navigate('/bills'),
    },
    {
      key: 'stock',
      label: 'Stock',
      icon: Package,
      active: pathname.startsWith('/stock'),
      onSelect: () => navigate('/stock'),
    },
    {
      key: 'customers',
      label: 'Customers',
      icon: Users,
      onSelect: () => toast.info('Customers — coming in Week 4'),
    },
    {
      key: 'rates',
      label: 'Rates',
      icon: CircleDollarSign,
      active: pathname.startsWith('/rates'),
      onSelect: () => navigate('/rates'),
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: LineChart,
      onSelect: () => toast.info('Reports — coming later in Phase 1'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      onSelect: () => toast.info('Settings — coming later in Phase 1'),
    },
  ]

  return (
    <>
      <AppShell navItems={navItems}>
        <Outlet />
      </AppShell>
      <Toaster />
    </>
  )
}
