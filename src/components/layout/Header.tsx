import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, Menu, Bell, Command } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

export default function Header() {
  const { theme, toggleTheme } = useThemeStore()
  const { setSidebarOpen } = useUIStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center h-11 px-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 gap-2">
      {/* Mobile menu */}
      <button
        className="md:hidden text-muted-foreground hover:text-foreground"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </button>

      

      <div className="ml-auto flex items-center gap-1">
        {/* Theme toggle */}
        <Tooltip content={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </Tooltip>

        {/* User avatar */}
        {user && (
          <Link to="/settings" className="ml-1">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-6 w-6 rounded-full object-cover border border-border hover:border-foreground/40 transition-colors"
            />
          </Link>
        )}
      </div>
    </header>
  )
}
