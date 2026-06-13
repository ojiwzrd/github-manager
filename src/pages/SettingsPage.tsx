import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Sun, Moon, LogOut, ExternalLink, Github, User, Palette, Shield, Eye, EyeOff, Activity, Clock, AlertCircle, RefreshCw, Info } from 'lucide-react'
import { githubService } from '@/lib/github'
import { Skeleton } from '@/components/ui/Skeleton'

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function SettingsPage() {
  const { user, logout, token } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const [showToken, setShowToken] = useState(false)

  const { data: rateLimit, isLoading: rateLimitLoading, error: rateLimitError, refetch: refetchRateLimit } = useQuery({
    queryKey: ['rate-limit'],
    queryFn: async () => {
      const result = await githubService.getRateLimit()
      return result
    },
    refetchInterval: 60000,
    enabled: !!token,
    retry: 2,
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getResetTime = (resetTimestamp: number) => {
    if (!resetTimestamp || resetTimestamp === 0) return 'Unknown'
    const resetDate = new Date(resetTimestamp * 1000)
    const now = new Date()
    const diffMs = resetDate.getTime() - now.getTime()
    if (diffMs <= 0) return 'Resetting now'
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    if (diffMins > 0) return `${diffMins}m ${diffSecs}s`
    return `${diffSecs}s`
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  // Extract rate limit data sesuai dokumentasi GitHub
  const getRateLimitData = () => {
    if (!rateLimit) return null
    
    // Response dari GET /rate_limit memiliki struktur { resources: { core: {...}, search: {...} } }
    if (rateLimit.resources && rateLimit.resources.core) {
      return {
        limit: rateLimit.resources.core.limit,
        remaining: rateLimit.resources.core.remaining,
        used: rateLimit.resources.core.used,
        reset: rateLimit.resources.core.reset,
        resource: 'core'
      }
    }
    
    // Fallback untuk response lain
    if (rateLimit.limit !== undefined) {
      return {
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        used: rateLimit.used,
        reset: rateLimit.reset,
        resource: 'core'
      }
    }
    
    return null
  }

  const rateLimitData = getRateLimitData()

  // Informasi rate limit berdasarkan dokumentasi GitHub
  const getRateLimitInfo = () => {
    if (!token) {
      return {
        title: 'Unauthenticated',
        limit: 60,
        description: 'Unauthenticated requests are limited to 60 requests per hour per IP address'
      }
    }
    
    // Untuk authenticated users dengan token
    return {
      title: 'Authenticated (Personal Access Token)',
      limit: 5000,
      description: 'Authenticated requests are limited to 5,000 requests per hour. GitHub Apps on Enterprise Cloud have 15,000 requests per hour.'
    }
  }

  const rateInfo = getRateLimitInfo()

  if (!user) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <a href={user.html_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
              View on GitHub
            </Button>
          </a>
        </CardHeader>
        <div className="flex items-start gap-4">
          <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full border border-border shrink-0" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-base font-semibold text-foreground">{user.name || user.login}</p>
              <p className="text-sm text-muted-foreground">@{user.login}</p>
            </div>
            {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">{user.public_repos} repos</span>
              <span className="text-xs text-muted-foreground">{user.followers} followers</span>
              <span className="text-xs text-muted-foreground">{user.following} following</span>
            </div>
            {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
            {user.company && <p className="text-xs text-muted-foreground">{user.company}</p>}
            {user.location && <p className="text-xs text-muted-foreground">{user.location}</p>}
          </div>
        </div>
      </Card>

      {/* API Rate Limit - Sesuai Dokumentasi GitHub */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>API Rate Limit</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {rateInfo.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => refetchRateLimit()}
              className="p-1 rounded hover:bg-accent transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <div className="space-y-3">
          {rateLimitLoading ? (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </>
          ) : rateLimitError ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Failed to load rate limit</p>
              <p className="text-xs text-muted-foreground mt-1">Check your token permissions</p>
              <button 
                onClick={() => refetchRateLimit()}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : rateLimitData ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Core API</span>
                  <Badge 
                    variant={
                      rateLimitData.remaining > rateLimitData.limit * 0.1 ? 'success' : 
                      rateLimitData.remaining > 0 ? 'warning' : 'destructive'
                    } 
                    size="sm"
                  >
                    {rateLimitData.remaining} / {rateLimitData.limit}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Resets at {formatDate(rateLimitData.reset)}</span>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    rateLimitData.remaining > rateLimitData.limit * 0.3 ? 'bg-green-500' : 
                    rateLimitData.remaining > rateLimitData.limit * 0.1 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${(rateLimitData.used / rateLimitData.limit) * 100}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-muted rounded">
                  <p className="text-muted-foreground">Limit</p>
                  <p className="font-semibold text-foreground">{rateLimitData.limit}</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="text-muted-foreground">Used</p>
                  <p className="font-semibold text-foreground">{rateLimitData.used}</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold text-foreground">{rateLimitData.remaining}</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Rate limit window resets in <strong>{getResetTime(rateLimitData.reset)}</strong></span>
                </p>
                
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Unable to fetch rate limit data</p>
              <p className="text-xs text-muted-foreground mt-1">The API rate limit endpoint may be unavailable</p>
            </div>
          )}
        </div>
      </Card>

      {/* Token */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted">
                <Github className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Your PAT</p>
                <p className="text-xs text-muted-foreground">Connected as @{user.login}</p>
              </div>
            </div>
            <Badge variant="success" dot>Active</Badge>
          </div>
          
          {token && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Current Token</label>
                <button 
                  onClick={() => setShowToken(!showToken)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-xs font-mono mt-1 break-all">
                {showToken ? token : '•'.repeat(Math.min(token.length, 40))}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Token starts with: {token.substring(0, 8)}...
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="destructive" size="sm" leftIcon={<LogOut className="h-3.5 w-3.5" />} onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Palette },
            ] as const).map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${theme === opt.value ? 'border-foreground/40 bg-accent' : 'border-border hover:bg-accent/50'}`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

    </div>
  )
}