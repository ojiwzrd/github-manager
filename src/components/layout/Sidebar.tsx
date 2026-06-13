import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, GitBranch, GitPullRequest, AlertCircle,
  Zap, Tag, Settings, Users, Building2, Search,
  ChevronLeft, ChevronRight, LogOut, BookOpen, Lock, Globe, Activity, Webhook
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import Tooltip from '@/components/ui/Tooltip'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Repositories', href: '/repositories' },
  
  { icon: AlertCircle, label: 'Issues', href: '/issues' },
  { icon: Zap, label: 'Actions', href: '/actions' },
  { icon: Tag, label: 'Releases', href: '/releases' },
  { icon: Activity, label: 'Activity', href: '/activity' },
  { icon: Search, label: 'Search', href: '/search' },
]

const settingsItems = [
  { icon: Lock, label: 'Secrets & Vars', href: '/secrets' },
  { icon: Webhook, label: 'Webhooks', href: '/webhooks' },
  { icon: Building2, label: 'Organizations', href: '/organizations' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface SidebarNavItemProps {
  item: { icon: React.FC<{ className?: string }>; label: string; href: string }
  collapsed: boolean
  active: boolean
}

function SidebarNavItem({ item, collapsed, active }: SidebarNavItemProps) {
  const { icon: Icon, label, href } = item

  const content = (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors',
        active
          ? 'bg-accent text-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )

  if (collapsed) {
    return <Tooltip content={label} side="right">{content}</Tooltip>
  }
  return content
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={cn(
      'hidden md:flex flex-col border-r border-border bg-[hsl(var(--sidebar-bg))] shrink-0 transition-all duration-200',
      sidebarCollapsed ? 'w-12' : 'w-52'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-11 border-b border-border px-2',
        sidebarCollapsed ? 'justify-center' : 'gap-2'
      )}>
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-foreground shrink-0">
          <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
            <path d="M16 4C9.373 4 4 9.373 4 16c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 16 9.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C24.566 25.797 28 21.3 28 16c0-6.627-5.373-12-12-12z" fill="hsl(var(--background))"/>
          </svg>
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold text-foreground truncate">GitHub Manager</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            collapsed={sidebarCollapsed}
            active={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
          />
        ))}

        <div className="my-2 h-px bg-border" />
        <p className={cn('px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider', sidebarCollapsed && 'hidden')}>
          Manage
        </p>

        {settingsItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            collapsed={sidebarCollapsed}
            active={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
          />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border p-2">
        {user && (
          <div className={cn('flex items-center gap-2 px-2 py-1.5 rounded-md', sidebarCollapsed && 'justify-center')}>
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-5 w-5 rounded-full shrink-0 object-cover"
            />
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user.name || user.login}</p>
                  <p className="text-[10px] text-muted-foreground truncate">@{user.login}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center justify-center w-full mt-1 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
          )}
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>
    </aside>
  )
}
