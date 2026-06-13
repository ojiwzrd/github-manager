import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Plus, CheckCircle2, MessageSquare, XCircle } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import RepoSelector from '@/components/features/RepoSelector'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { Issue, Repository } from '@/types'

type IssueState = 'open' | 'closed' | 'all'

export default function IssuesPage() {
  const { success, error: toastError } = useToast()
  const queryClient = useQueryClient()
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [state, setState] = useState<IssueState>('open')
  const [createOpen, setCreateOpen] = useState(false)
  const [newIssue, setNewIssue] = useState({ title: '', body: '' })

  const { data: issues = [], isLoading } = useQuery<Issue[]>({
    queryKey: ['issues', selectedRepo?.full_name, state],
    queryFn: async () => {
      const data = await githubService.getIssues(selectedRepo!.owner.login, selectedRepo!.name, { state, per_page: 50 })
      // Filter out pull requests from issues
      return data.filter((item: any) => !item.pull_request)
    },
    enabled: !!selectedRepo,
  })

  const createMutation = useMutation({
    mutationFn: () => githubService.createIssue(selectedRepo!.owner.login, selectedRepo!.name, newIssue),
    onSuccess: () => {
      success('Issue created')
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      setCreateOpen(false)
      setNewIssue({ title: '', body: '' })
    },
    onError: (e: any) => toastError('Failed', e?.response?.data?.message),
  })

  const closeMutation = useMutation({
    mutationFn: (issue: Issue) =>
      githubService.updateIssue(selectedRepo!.owner.login, selectedRepo!.name, issue.number, {
        state: issue.state === 'open' ? 'closed' : 'open',
      }),
    onSuccess: () => {
      success('Issue updated')
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Issues</h1>
          <p className="text-sm text-muted-foreground">Track bugs and feature requests</p>
        </div>
        <Button size="md" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCreateOpen(true)} disabled={!selectedRepo}>
          New issue
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-72">
          <RepoSelector value={selectedRepo?.full_name} onChange={setSelectedRepo} />
        </div>
        <div className="flex rounded-md border border-border overflow-hidden">
          {(['open', 'closed', 'all'] as IssueState[]).map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={cn('px-3 py-1.5 text-sm capitalize transition-colors', state === s ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:text-foreground')}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{isLoading ? '...' : `${issues.length} issues`}</span>
      </div>

      {!selectedRepo ? (
        <EmptyState icon={AlertCircle} title="Select a repository" description="Choose a repository to view its issues" />
      ) : isLoading ? (
        <SkeletonList />
      ) : issues.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No issues"
          description={`No ${state === 'all' ? '' : state} issues in this repository`}
          action={{ label: 'Create issue', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-border">
            {issues.map((issue) => (
              <div key={issue.id} className="flex items-start gap-4 px-4 py-4 hover:bg-accent/50 transition-colors">
                <div className="mt-0.5 shrink-0">
                  {issue.state === 'open'
                    ? <AlertCircle className="h-4 w-4 text-green-500" />
                    : <CheckCircle2 className="h-4 w-4 text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:underline">
                      {issue.title}
                    </a>
                    {issue.labels.map((l) => (
                      <span
                        key={l.id}
                        className="px-1.5 py-0.5 text-xs rounded-full font-medium shrink-0"
                        style={{ background: `#${l.color}20`, color: `#${l.color}` }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    #{issue.number} {issue.state === 'closed' ? 'closed' : 'opened'} {formatRelativeTime(issue.created_at)} by{' '}
                    <span className="font-medium">{issue.user.login}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {issue.comments > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> {issue.comments}
                    </span>
                  )}
                  {issue.assignees.length > 0 && (
                    <div className="flex -space-x-1">
                      {issue.assignees.slice(0, 3).map((a) => (
                        <img key={a.login} src={a.avatar_url} alt={a.login} className="h-5 w-5 rounded-full border border-background" />
                      ))}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => closeMutation.mutate(issue)}
                    loading={closeMutation.isPending}
                    className="text-muted-foreground"
                  >
                    {issue.state === 'open' ? <XCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Issue"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Create issue</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} placeholder="Issue title" />
          <Textarea label="Description" value={newIssue.body} onChange={(e) => setNewIssue({ ...newIssue, body: e.target.value })} placeholder="Describe the issue..." className="min-h-[120px]" />
        </div>
      </Modal>
    </div>
  )
}
