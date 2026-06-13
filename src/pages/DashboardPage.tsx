import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, GitPullRequest, AlertCircle, Tag, Zap, Building2, Lock, Globe, GitCommit, Activity, TrendingUp, Star } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useAuthStore } from '@/stores/authStore'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { formatRelativeTime, formatNumber, getLanguageColor } from '@/lib/utils'
import type { Repository, WorkflowRun } from '@/types'

interface StatCardProps {
  icon: React.FC<{ className?: string }>
  label: string
  value: string | number
  sub?: string
  color?: string
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-muted-foreground' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex items-center justify-center h-9 w-9 rounded-lg bg-muted shrink-0`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: repos = [], isLoading: reposLoading } = useQuery<Repository[]>({
    queryKey: ['dashboard-repos'],
    queryFn: () => githubService.getRepositories({ per_page: 100, type: 'all' }),
  })

  const { data: orgs = [] } = useQuery({
    queryKey: ['user-orgs'],
    queryFn: () => githubService.getUserOrgs(),
  })

  const { data: events = [] } = useQuery({
    queryKey: ['user-events', user?.login],
    queryFn: () => githubService.getUserEvents(user!.login, { per_page: 15 }),
    enabled: !!user?.login,
  })

  const publicRepos = repos.filter((r) => !r.private)
  const privateRepos = repos.filter((r) => r.private)
  const recentRepos = [...repos].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 6)
  const starredRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5)

  const stats = [
    { icon: BookOpen, label: 'Total Repos', value: repos.length, color: 'text-blue-500' },
    { icon: Globe, label: 'Public', value: publicRepos.length, color: 'text-green-500' },
    { icon: Lock, label: 'Private', value: privateRepos.length, color: 'text-yellow-500' },
    { icon: Building2, label: 'Organizations', value: orgs.length, color: 'text-purple-500' },
  ]

  const getEventDescription = (event: any): string => {
    switch (event.type) {
      case 'PushEvent': return `Pushed ${event.payload?.commits?.length || 0} commit(s) → ${event.repo?.name}`
      case 'CreateEvent': return `Created ${event.payload?.ref_type} in ${event.repo?.name}`
      case 'PullRequestEvent': return `PR ${event.payload?.action} in ${event.repo?.name}`
      case 'IssuesEvent': return `Issue ${event.payload?.action} in ${event.repo?.name}`
      case 'WatchEvent': return `★ ${event.repo?.name}`
      case 'ForkEvent': return `Forked ${event.repo?.name}`
      case 'DeleteEvent': return `Deleted in ${event.repo?.name}`
      default: return `${event.type} in ${event.repo?.name}`
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PushEvent': return <GitCommit className="h-3.5 w-3.5" />
      case 'PullRequestEvent': return <GitPullRequest className="h-3.5 w-3.5" />
      case 'IssuesEvent': return <AlertCircle className="h-3.5 w-3.5" />
      case 'WatchEvent': return <Star className="h-3.5 w-3.5" />
      default: return <Activity className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0] || user?.login}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">GitHub overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reposLoading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent repositories */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent repos</h2>
            <a href="/repositories" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {reposLoading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : recentRepos.map((repo) => (
                <a key={repo.id} href={`/repositories/${repo.owner.login}/${repo.name}`}>
                  <Card hover className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{repo.name}</p>
                        <Badge variant={repo.private ? 'warning' : 'success'} size="sm">
                          {repo.private ? 'Private' : 'Public'}
                        </Badge>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {repo.language && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: getLanguageColor(repo.language) }}
                            />
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3" />
                            {formatNumber(repo.stargazers_count)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(repo.updated_at)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Activity</h2>
          <Card padding="none" className="divide-y divide-border overflow-hidden">
            {events.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No recent activity</div>
            ) : (
              events.slice(0, 8).map((event: any, i: number) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted shrink-0 mt-0.5 text-muted-foreground">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{getEventDescription(event)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(event.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      {/* Top starred repos */}
      {starredRepos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Top starred</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {starredRepos.map((repo) => (
              <a key={repo.id} href={`/repositories/${repo.owner.login}/${repo.name}`}>
                <Card hover className="h-full">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{repo.name}</p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Star className="h-3 w-3" />
                      {formatNumber(repo.stargazers_count)}
                    </span>
                  </div>
                  {repo.language && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: getLanguageColor(repo.language) }} />
                      {repo.language}
                    </span>
                  )}
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
