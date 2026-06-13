import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, GitCommit, GitPullRequest, AlertCircle, Star, GitFork, Plus, Trash2 } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useAuthStore } from '@/stores/authStore'
import Card from '@/components/ui/Card'
import { SkeletonList } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/lib/utils'

const eventIcons: Record<string, React.FC<{ className?: string }>> = {
  PushEvent: ({ className }) => <GitCommit className={className} />,
  PullRequestEvent: ({ className }) => <GitPullRequest className={className} />,
  IssuesEvent: ({ className }) => <AlertCircle className={className} />,
  WatchEvent: ({ className }) => <Star className={className} />,
  ForkEvent: ({ className }) => <GitFork className={className} />,
  CreateEvent: ({ className }) => <Plus className={className} />,
  DeleteEvent: ({ className }) => <Trash2 className={className} />,
}

const eventColors: Record<string, string> = {
  PushEvent: 'text-blue-500',
  PullRequestEvent: 'text-purple-500',
  IssuesEvent: 'text-green-500',
  WatchEvent: 'text-yellow-500',
  ForkEvent: 'text-orange-500',
  CreateEvent: 'text-teal-500',
  DeleteEvent: 'text-red-500',
}

function getEventTitle(event: any): string {
  switch (event.type) {
    case 'PushEvent':
      return `Pushed ${event.payload?.commits?.length || 0} commit(s) to`
    case 'PullRequestEvent':
      return `${event.payload?.action} pull request in`
    case 'IssuesEvent':
      return `${event.payload?.action} issue in`
    case 'WatchEvent':
      return `Starred`
    case 'ForkEvent':
      return `Forked`
    case 'CreateEvent':
      return `Created ${event.payload?.ref_type}${event.payload?.ref ? ` "${event.payload.ref}" in` : ''}`
    case 'DeleteEvent':
      return `Deleted ${event.payload?.ref_type} in`
    default:
      return `${event.type} in`
  }
}

export default function ActivityPage() {
  const { user } = useAuthStore()

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['activity', user?.login],
    queryFn: () => githubService.getUserEvents(user!.login, { per_page: 50 }),
    enabled: !!user?.login,
    refetchInterval: 30000,
  })

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Activity Feed</h1>
        <p className="text-sm text-muted-foreground">Your recent GitHub activity</p>
      </div>

      {isLoading ? (
        <SkeletonList count={8} />
      ) : events.length === 0 ? (
        <EmptyState icon={Activity} title="No recent activity" description="Your GitHub activity will appear here" />
      ) : (
        <div className="relative">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-3">
            {events.map((event: any, i: number) => {
              const Icon = eventIcons[event.type] || (({ className }) => <Activity className={className} />)
              const color = eventColors[event.type] || 'text-muted-foreground'
              return (
                <div key={event.id || i} className="flex items-start gap-4">
                  <div className={`flex items-center justify-center h-7 w-7 rounded-full bg-card border border-border shrink-0 relative z-10 ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <Card className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-foreground">
                          <span>{getEventTitle(event)} </span>
                          <a
                            href={`https://github.com/${event.repo?.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {event.repo?.name}
                          </a>
                        </p>
                        {event.payload?.commits?.[0] && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                            {event.payload.commits[0].message}
                          </p>
                        )}
                        {event.payload?.pull_request?.title && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            #{event.payload.pull_request.number}: {event.payload.pull_request.title}
                          </p>
                        )}
                        {event.payload?.issue?.title && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            #{event.payload.issue.number}: {event.payload.issue.title}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeTime(event.created_at)}
                      </span>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
