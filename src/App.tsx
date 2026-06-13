import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { ToastProvider } from '@/components/ui/Toast'
import AppLayout from '@/components/layout/AppLayout'

// Pages
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import RepositoriesPage from '@/pages/RepositoriesPage'
import RepositoryDetailPage from '@/pages/RepositoryDetailPage'
import FileManagerPage from '@/pages/FileManagerPage'

import IssuesPage from '@/pages/IssuesPage'
import ActionsPage from '@/pages/ActionsPage'
import ReleasesPage from '@/pages/ReleasesPage'
import SecretsPage from '@/pages/SecretsPage'
import WebhooksPage from '@/pages/WebhooksPage'
import OrganizationsPage from '@/pages/OrganizationsPage'
import ActivityPage from '@/pages/ActivityPage'
import SearchPage from '@/pages/SearchPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

export default function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/repositories" element={<ProtectedRoute><RepositoriesPage /></ProtectedRoute>} />
        <Route path="/repositories/:owner/:repo" element={<ProtectedRoute><RepositoryDetailPage /></ProtectedRoute>} />
        <Route path="/repositories/:owner/:repo/files" element={<ProtectedRoute><FileManagerPage /></ProtectedRoute>} />
        <Route path="/repositories/:owner/:repo/files/*" element={<ProtectedRoute><FileManagerPage /></ProtectedRoute>} />
        
        <Route path="/issues" element={<ProtectedRoute><IssuesPage /></ProtectedRoute>} />
        <Route path="/actions" element={<ProtectedRoute><ActionsPage /></ProtectedRoute>} />
        <Route path="/releases" element={<ProtectedRoute><ReleasesPage /></ProtectedRoute>} />
        <Route path="/secrets" element={<ProtectedRoute><SecretsPage /></ProtectedRoute>} />
        <Route path="/webhooks" element={<ProtectedRoute><WebhooksPage /></ProtectedRoute>} />
        <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ToastProvider>
  )
}
