import React, { useState, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, BookOpen, AlertCircle, Users, Star, GitFork, Eye,
  Clock, Code, ExternalLink, GitBranch, ChevronDown, ChevronUp,
  Lock, Globe, GitPullRequest, X, Loader2
} from 'lucide-react'
import { githubService } from '@/lib/github'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { formatRelativeTime, formatNumber, getLanguageColor, cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

type SearchType = 'repositories' | 'issues' | 'users' | 'code'

// ─── Repo detail card ─────────────────────────────────────────────────────────
function RepoCard({ repo, isOwn }: { repo: any; isOwn: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleOpen = () => {
    if (isOwn) {
      navigate(`/repositories/${repo.owner.login}/${repo.name}`)
    } else {
      window.open(repo.html_url, '_blank', 'noopener')
    }
  }

  return (
    <Card className="group transition-all hover:shadow-sm" padding="none">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="h-9 w-9 rounded-full shrink-0 border border-border"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleOpen}
                    className="text-sm font-semibold text-foreground hover:underline truncate"
                  >
                    {repo.full_name}
                  </button>
                  <Badge variant={repo.private ? 'warning' : 'success'} size="sm">
                    {repo.private ? <><Lock className="h-2.5 w-2.5 mr-1" />Private</> : <><Globe className="h-2.5 w-2.5 mr-1" />Public</>}
                  </Badge>
                  {repo.fork && <Badge variant="outline" size="sm">Fork</Badge>}
                  {repo.archived && <Badge variant="default" size="sm">Archived</Badge>}
                </div>
                {repo.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{repo.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isOwn && (
                  <button
                    onClick={() => navigate(`/repositories/${repo.owner.login}/${repo.name}`)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Open
                  </button>
                )}
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="View on GitHub"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {repo.language && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: getLanguageColor(repo.language) }} />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" /> {formatNumber(repo.stargazers_count)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <GitFork className="h-3 w-3" /> {formatNumber(repo.forks_count)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" /> {formatNumber(repo.watchers_count)}
              </span>
              {repo.open_issues_count > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" /> {formatNumber(repo.open_issues_count)} issues
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                <Clock className="h-3 w-3" /> {formatRelativeTime(repo.updated_at)}
              </span>
            </div>

            {/* Topics */}
            {repo.topics?.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {repo.topics.slice(0, 6).map((t: string) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {t}
                  </span>
                ))}
                {repo.topics.length > 6 && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">
                    +{repo.topics.length - 6}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center justify-center gap-1 w-full py-1.5 border-t border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? 'Less' : 'More details'}
      </button>

      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border bg-muted/20">
          <div className="pt-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">Default branch</p>
            <p className="text-xs text-foreground mt-0.5 flex items-center gap-1">
              <GitBranch className="h-3 w-3" /> {repo.default_branch || 'main'}
            </p>
          </div>
          <div className="pt-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">License</p>
            <p className="text-xs text-foreground mt-0.5">{repo.license?.spdx_id || '—'}</p>
          </div>
          <div className="pt-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">Size</p>
            <p className="text-xs text-foreground mt-0.5">{repo.size ? `${formatNumber(repo.size)} KB` : '—'}</p>
          </div>
          <div className="pt-3">
            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">Created</p>
            <p className="text-xs text-foreground mt-0.5">{formatRelativeTime(repo.created_at)}</p>
          </div>
          {isOwn && (
            <div className="col-span-2 sm:col-span-4 pt-2 flex gap-2">
              <a
                href={`/repositories/${repo.owner.login}/${repo.name}/files`}
                onClick={e => { e.preventDefault(); window.location.href = `/repositories/${repo.owner.login}/${repo.name}/files` }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Code className="h-3 w-3" /> Browse files
              </a>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── Issue card ────────────────────────────────────────────────────────────────
function IssueCard({ issue }: { issue: any }) {
  const isPR = !!issue.pull_request
  const isOpen = issue.state === 'open'

  return (
    <Card className="hover:shadow-sm transition-all" padding="none">
      <div className="p-3.5 flex items-start gap-3">
        <div className={cn(
          'flex items-center justify-center h-6 w-6 rounded-full shrink-0 mt-0.5',
          isOpen ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'
        )}>
          {isPR ? <GitPullRequest className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{issue.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {issue.repository_url?.split('/').slice(-2).join('/')} · #{issue.number}
              </p>
            </div>
            <Badge variant={isOpen ? 'success' : 'default'} size="sm">{issue.state}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {issue.labels?.slice(0, 3).map((l: any) => (
              <span
                key={l.id}
                className="px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                style={{
                  background: `#${l.color}22`,
                  color: `#${l.color}`,
                  border: `1px solid #${l.color}44`,
                }}
              >
                {l.name}
              </span>
            ))}
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" /> {formatRelativeTime(issue.created_at)}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-3.5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={issue.user?.avatar_url} alt={issue.user?.login} className="h-4 w-4 rounded-full" />
          <span className="text-xs text-muted-foreground">{issue.user?.login}</span>
        </div>
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" /> GitHub
        </a>
      </div>
    </Card>
  )
}

// ─── User card ────────────────────────────────────────────────────────────────
function UserCard({ user }: { user: any }) {
  return (
    <Card className="hover:shadow-sm transition-all" padding="none">
      <div className="p-3.5 flex items-center gap-3">
        <img src={user.avatar_url} alt={user.login} className="h-10 w-10 rounded-full shrink-0 border border-border" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{user.login}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.type?.toLowerCase()}</p>
        </div>
        <a
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ExternalLink className="h-3 w-3" /> Profile
        </a>
      </div>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const TYPES: { id: SearchType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'repositories', label: 'Repos', icon: BookOpen },
  { id: 'issues', label: 'Issues & PRs', icon: AlertCircle },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'code', label: 'Code', icon: Code },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<SearchType>('repositories')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const { user: authUser } = useAuthStore()

  const handleSearch = (val: string) => {
    setQuery(val)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebouncedQuery(val), 400)
  }

  const clearSearch = () => { setQuery(''); setDebouncedQuery('') }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', type, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null
      switch (type) {
        case 'repositories': return githubService.searchRepositories(debouncedQuery, { sort: 'stars', per_page: 24 })
        case 'issues': return githubService.searchIssues(debouncedQuery, { per_page: 20 })
        case 'users': return githubService.searchUsers(debouncedQuery, { per_page: 20 })
        case 'code': return githubService.searchCode(debouncedQuery, { per_page: 20 })
      }
    },
    enabled: !!debouncedQuery.trim(),
    staleTime: 30_000,
  })

  const items = data?.items || []
  const total = data?.total_count || 0
  const isSearching = isLoading || isFetching

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground">Search</h1>
        <p className="text-xs text-muted-foreground">Search across GitHub — repositories, issues, users, and code</p>
      </div>

      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search GitHub..."
          className="w-full h-10 pl-9 pr-10 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          {query && (
            <button onClick={clearSearch} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 bg-muted p-0.5 rounded-lg w-fit">
        {TYPES.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                type === t.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3 w-3" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {!debouncedQuery.trim() ? (
        <div className="py-12">
          <EmptyState
            icon={Search}
            title="Start searching"
            description="Repositories, issues, users, and code from GitHub"
          />
        </div>
      ) : isLoading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Search} title="No results" description={`Nothing found for "${debouncedQuery}"`} />
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isFetching ? 'Searching…' : <><strong className="text-foreground">{formatNumber(total)}</strong> results</>}
            </p>
          </div>

          {type === 'repositories' && items.map((repo: any) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isOwn={repo.owner.login === authUser?.login}
            />
          ))}

          {type === 'issues' && items.map((issue: any) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}

          {type === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((u: any) => <UserCard key={u.id} user={u} />)}
            </div>
          )}

          {type === 'code' && items.map((item: any) => (
            <Card key={item.sha} className="hover:shadow-sm transition-all" padding="none">
              <div className="p-3.5 flex items-start gap-3">
                <Code className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.repository?.full_name} · {item.path}</p>
                </div>
                <a
                  href={item.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
