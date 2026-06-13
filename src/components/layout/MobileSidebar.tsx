import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { X, LayoutDashboard, GitBranch, GitPullRequest, AlertCircle, Zap, Tag, Settings, Users, Building2, Search, Lock, Activity, Webhook, LogOut, BookOpen } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const allNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Repositories', href: '/repositories' },
  
  { icon: AlertCircle, label: 'Issues', href: '/issues' },
  { icon: Zap, label: 'Actions', href: '/actions' },
  { icon: Tag, label: 'Releases', href: '/releases' },
  { icon: Activity, label: 'Activity', href: '/activity' },
  { icon: Search, label: 'Search', href: '/search' },
  null,
  { icon: Lock, label: 'Secrets & Vars', href: '/secrets' },
  { icon: Webhook, label: 'Webhooks', href: '/webhooks' },
  { icon: Building2, label: 'Organizations', href: '/organizations' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function MobileSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user, logout } = useAuthStore()

  const close = () => setSidebarOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    close()
  }

  if (!sidebarOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col animate-slide-in">
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-foreground">
              <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
                <path d="M16 4C9.373 4 4 9.373 4 16c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 16 9.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C24.566 25.797 28 21.3 28 16c0-6.627-5.373-12-12-12z" fill="hsl(var(--background))"/>
              </svg>
            </div>
            <span className="text-sm font-semibold">GitHub Manager</span>
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {allNavItems.map((item, i) => {
            if (!item) return <div key={i} className="my-2 h-px bg-border" />
            const Icon = item.icon
            const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={close}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  active ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {user && (
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <img src={user.avatar_url} alt={user.login} className="h-7 w-7 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || user.login}</p>
                <p className="text-xs text-muted-foreground">@{user.login}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-1">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
