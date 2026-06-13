import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  BookOpen, GitBranch, GitPullRequest, AlertCircle, Star, GitFork, 
  Eye, Code2, Tag, Users, Folder, ExternalLink, Lock, Globe, Calendar,
  MessageSquare, History, User
} from 'lucide-react'
import { githubService } from '@/lib/github'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatRelativeTime, formatNumber, getLanguageColor } from '@/lib/utils'

export default function RepositoryDetailPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const navigate = useNavigate()

  const { data: repository, isLoading } = useQuery({
    queryKey: ['repo', owner, repo],
    queryFn: () => githubService.getRepository(owner!, repo!),
    enabled: !!owner && !!repo,
  })

  const { data: commits = [] } = useQuery({
    queryKey: ['commits', owner, repo],
    queryFn: () => githubService.getCommits(owner!, repo!, { per_page: 5 }),
    enabled: !!owner && !!repo,
  })

  const { data: languages = {} } = useQuery({
    queryKey: ['languages', owner, repo],
    queryFn: () => githubService.getRepoLanguages(owner!, repo!),
    enabled: !!owner && !!repo,
  })

  const { data: contributors = [] } = useQuery({
    queryKey: ['contributors', owner, repo],
    queryFn: () => githubService.getContributors(owner!, repo!),
    enabled: !!owner && !!repo,
  })

  if (isLoading) {
    return (
      <div className="p-3 space-y-3 max-w-6xl mx-auto">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-4 gap-2">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    )
  }

  if (!repository) return null

  const totalLangBytes = Object.values(languages as Record<string, number>).reduce((a, b) => a + b, 0)

  const navItems = [
    { icon: Code2, label: 'Code', href: `/repositories/${owner}/${repo}/files` },
    { icon: AlertCircle, label: 'Issues', href: `/issues` },
    { icon: History, label: 'Actions', href: `/actions` },
  ]

  return (
    <div className="p-3 space-y-3 max-w-6xl mx-auto">
      {/* Repository header - lebih compact */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">/</span>
        <span className="font-semibold text-foreground">{repository.name}</span>
        <Badge variant={repository.private ? 'warning' : 'success'} size="sm">
          {repository.private ? 'Private' : 'Public'}
        </Badge>
        {repository.private && <Lock className="h-3 w-3 text-muted-foreground" />}
      </div>

      {repository.description && (
        <p className="text-xs text-muted-foreground">{repository.description}</p>
      )}

      {/* Stats row - lebih kecil dan compact */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {[
          { icon: Star, label: formatNumber(repository.stargazers_count), text: 'stars' },
          { icon: GitFork, label: formatNumber(repository.forks_count), text: 'forks' },
          { icon: AlertCircle, label: formatNumber(repository.open_issues_count), text: 'issues' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.text} className="flex items-center gap-1 text-muted-foreground">
              <Icon className="h-3 w-3" />
              <span className="font-medium text-foreground">{stat.label}</span>
              <span>{stat.text}</span>
            </div>
          )
        })}
        {repository.language && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="h-2 w-2 rounded-full" style={{ background: getLanguageColor(repository.language) }} />
            <span className="text-foreground">{repository.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Updated {formatRelativeTime(repository.updated_at)}</span>
        </div>
      </div>

      {/* Topics - lebih kecil */}
      {repository.topics?.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {repository.topics.slice(0, 5).map((t: string) => (
            <span key={t} className="px-1.5 py-0.5 text-[11px] bg-blue-500/10 text-blue-600 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Navigation - lebih compact seperti GitHub */}
      <div className="flex gap-1 border-b border-border">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-b-2 border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Main content grid - lebih compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent commits section */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground">Recent commits</h3>
            
          </div>
          
          <div className="border border-border rounded-md overflow-hidden">
            <div className="divide-y divide-border">
              {commits.slice(0, 4).map((commit: any) => (
                <div key={commit.sha} className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50">
                  {commit.author?.avatar_url ? (
                    <img src={commit.author.avatar_url} alt={commit.author.login} className="h-5 w-5 rounded-full shrink-0" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-blue-600 hover:underline block truncate">
                      {commit.commit.message.split('\n')[0]}
                    </a>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <span>{commit.author?.login || commit.commit.author.name}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(commit.commit.author.date)}</span>
                      <code className="font-mono">{commit.sha.slice(0, 7)}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - lebih compact */}
        <div className="space-y-3">
          {/* Languages card - lebih kecil */}
          {Object.keys(languages).length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-foreground">Languages</h3>
              <div className="border border-border rounded-md p-2">
                <div className="flex h-1.5 rounded-full overflow-hidden mb-2">
                  {Object.entries(languages as Record<string, number>).slice(0, 5).map(([lang, bytes]) => (
                    <div
                      key={lang}
                      className="h-full"
                      style={{
                        width: `${(bytes / totalLangBytes * 100).toFixed(1)}%`,
                        background: getLanguageColor(lang),
                      }}
                    />
                  ))}
                </div>
                <div className="space-y-1">
                  {Object.entries(languages as Record<string, number>).slice(0, 4).map(([lang, bytes]) => (
                    <div key={lang} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ background: getLanguageColor(lang) }} />
                        <span className="text-foreground">{lang}</span>
                      </span>
                      <span className="text-muted-foreground">{((bytes / totalLangBytes) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contributors card - lebih kecil dan compact */}
          {contributors.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-foreground">Contributors</h3>
              <div className="border border-border rounded-md p-2">
                <div className="space-y-1.5">
                  {contributors.slice(0, 4).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <img src={c.avatar_url} alt={c.login} className="h-5 w-5 rounded-full shrink-0" />
                      <span className="text-xs text-foreground flex-1 truncate">{c.login}</span>
                      <span className="text-[11px] text-muted-foreground">{c.contributions}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* About section - lebih compact */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-foreground">About</h3>
            <div className="border border-border rounded-md p-2 text-[11px] space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3" />
                <span>{formatNumber(repository.stargazers_count)} stars</span>
              </div>
              <div className="flex items-center gap-2">
                <GitFork className="h-3 w-3" />
                <span>{formatNumber(repository.forks_count)} forks</span>
              </div>
              {repository.homepage && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" />
                  <a href={repository.homepage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {repository.homepage.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}