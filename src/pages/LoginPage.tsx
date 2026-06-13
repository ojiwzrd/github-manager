import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Github, ArrowRight, Lock, Zap, Shield, Star } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { githubService } from '@/lib/github'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import heroImg from '@/assets/hero-dashboard.jpg'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const { error: toastError } = useToast()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    setLoading(true)
    console.log('Attempting GitHub login...')

    try {
      // Store token temporarily to make API call
      useAuthStore.getState().setToken(token.trim())
      const user = await githubService.getAuthenticatedUser()
      console.log('User fetched:', user.login)
      login(user, token.trim())
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      useAuthStore.getState().setToken(null)
      toastError(
        'Authentication failed',
        err?.response?.status === 401
          ? 'Invalid token. Please check your GitHub Personal Access Token.'
          : 'Could not connect to GitHub. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Zap, label: 'Repository Management', desc: 'Full CRUD for repos, branches, files' },
    { icon: GitFork, label: 'PR & Issue Tracking', desc: 'Create, merge, close with ease' },
    { icon: Shield, label: 'Actions & Secrets', desc: 'Manage workflows and secrets' },
    { icon: Star, label: 'File Editor', desc: 'Monaco editor with syntax highlight' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-foreground">
                <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6">
                  <path d="M16 4C9.373 4 4 9.373 4 16c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 16 9.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C24.566 25.797 28 21.3 28 16c0-6.627-5.373-12-12-12z" fill="hsl(var(--background))"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">GitHub Manager</h1>
                <p className="text-xs text-muted-foreground">All GitHub features in one dashboard</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Sign in to your account</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Use your GitHub Personal Access Token to authenticate.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <Input
                label="Personal Access Token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                leftIcon={<Lock className="h-3.5 w-3.5" />}
              />
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full"
                leftIcon={<Github className="h-4 w-4" />}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {loading ? 'Signing in...' : 'Sign in with GitHub'}
              </Button>
            </form>

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
              <p className="text-xs font-medium text-foreground">Required token scopes:</p>
              <div className="flex flex-wrap gap-1.5">
                {['repo', 'read:org', 'read:user', 'workflow', 'admin:repo_hook'].map((scope) => (
                  <code key={scope} className="text-xs font-mono bg-background border border-border rounded px-1.5 py-0.5 text-muted-foreground">{scope}</code>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Create a token at{' '}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2 hover:no-underline"
                >
                  github.com/settings/tokens
                </a>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-card">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right panel - Hero image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src={heroImg}
          alt="GitHub Manager Dashboard"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="rounded-xl border border-border/30 bg-black/40 backdrop-blur-md p-5">
            <p className="text-sm font-medium text-white/90 mb-1">All in one place</p>
            <p className="text-xs text-white/60">
              Repositories, branches, PRs, issues, actions, secrets — manage your entire GitHub workflow from a single beautiful dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GitFork({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/>
      <path d="M6 9v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"/><line x1="12" y1="12" x2="12" y2="15"/>
    </svg>
  )
}
