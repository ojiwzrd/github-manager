import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Zap, RefreshCw, XCircle, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import RepoSelector from '@/components/features/RepoSelector'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { Workflow, WorkflowRun, Repository } from '@/types'

function RunStatusIcon({ status, conclusion }: { status: string | null; conclusion: string | null }) {
  if (status === 'in_progress') return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
  if (status === 'queued') return <Clock className="h-4 w-4 text-blue-500" />
  if (conclusion === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500" />
  if (conclusion === 'failure') return <XCircle className="h-4 w-4 text-red-500" />
  if (conclusion === 'cancelled') return <Circle className="h-4 w-4 text-muted-foreground" />
  return <AlertCircle className="h-4 w-4 text-muted-foreground" />
}

function getRunBadge(status: string | null, conclusion: string | null) {
  if (status === 'in_progress') return <Badge variant="warning" dot>In Progress</Badge>
  if (status === 'queued') return <Badge variant="info" dot>Queued</Badge>
  if (conclusion === 'success') return <Badge variant="success" dot>Success</Badge>
  if (conclusion === 'failure') return <Badge variant="error" dot>Failed</Badge>
  if (conclusion === 'cancelled') return <Badge variant="default">Cancelled</Badge>
  return <Badge variant="default">{conclusion || status || 'Unknown'}</Badge>
}

export default function ActionsPage() {
  const { success, error: toastError } = useToast()
  const queryClient = useQueryClient()
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | 'all'>('all')

  const { data: workflows = [], isLoading: wfLoading } = useQuery<Workflow[]>({
    queryKey: ['workflows', selectedRepo?.full_name],
    queryFn: async () => {
      const data = await githubService.getWorkflows(selectedRepo!.owner.login, selectedRepo!.name)
      return data.workflows || []
    },
    enabled: !!selectedRepo,
  })

  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['workflow-runs', selectedRepo?.full_name, selectedWorkflow],
    queryFn: () => githubService.getWorkflowRuns(selectedRepo!.owner.login, selectedRepo!.name, {
      workflow_id: selectedWorkflow === 'all' ? undefined : selectedWorkflow,
      per_page: 30,
    }),
    enabled: !!selectedRepo,
    refetchInterval: 15000,
  })

  const runs: WorkflowRun[] = runsData?.workflow_runs || []

  const reRunMutation = useMutation({
    mutationFn: (runId: number) => githubService.reRunWorkflow(selectedRepo!.owner.login, selectedRepo!.name, runId),
    onSuccess: () => {
      success('Workflow re-run triggered')
      queryClient.invalidateQueries({ queryKey: ['workflow-runs'] })
    },
    onError: (e: any) => toastError('Failed to re-run', e?.response?.data?.message),
  })

  const cancelMutation = useMutation({
    mutationFn: (runId: number) => githubService.cancelWorkflowRun(selectedRepo!.owner.login, selectedRepo!.name, runId),
    onSuccess: () => {
      success('Workflow cancelled')
      queryClient.invalidateQueries({ queryKey: ['workflow-runs'] })
    },
    onError: (e: any) => toastError('Failed to cancel', e?.response?.data?.message),
  })

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">GitHub Actions</h1>
        <p className="text-sm text-muted-foreground">Monitor and manage your CI/CD workflows</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-72">
          <RepoSelector value={selectedRepo?.full_name} onChange={setSelectedRepo} />
        </div>
        {workflows.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedWorkflow('all')}
              className={cn('px-3 py-1.5 text-xs rounded-md border transition-colors', selectedWorkflow === 'all' ? 'bg-accent border-foreground/20 text-foreground font-medium' : 'border-border text-muted-foreground hover:text-foreground')}
            >
              All workflows
            </button>
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setSelectedWorkflow(wf.id)}
                className={cn('px-3 py-1.5 text-xs rounded-md border transition-colors', selectedWorkflow === wf.id ? 'bg-accent border-foreground/20 text-foreground font-medium' : 'border-border text-muted-foreground hover:text-foreground')}
              >
                {wf.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedRepo ? (
        <EmptyState icon={Zap} title="Select a repository" description="Choose a repository to view its workflows" />
      ) : runsLoading ? (
        <SkeletonList />
      ) : runs.length === 0 ? (
        <EmptyState icon={Zap} title="No workflow runs" description="No workflow runs found for this repository" />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-border">
            {runs.map((run) => (
              <div key={run.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-accent/50 transition-colors">
                <RunStatusIcon status={run.status} conclusion={run.conclusion} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{run.display_title || run.name || 'Workflow run'}</p>
                    {getRunBadge(run.status, run.conclusion)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono">{run.head_commit?.message?.split('\n')[0]}</span>
                    {' · '}
                    <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">{run.branch}</span>
                    {' · '}
                    #{run.run_number} triggered by{' '}
                    <span className="font-medium">{run.actor?.login}</span>
                    {' · '}{formatRelativeTime(run.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(run.status === 'completed' || run.status === null) && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<RefreshCw className="h-3 w-3" />}
                      onClick={() => reRunMutation.mutate(run.id)}
                      loading={reRunMutation.isPending}
                    >
                      Re-run
                    </Button>
                  )}
                  {run.status === 'in_progress' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelMutation.mutate(run.id)}
                      loading={cancelMutation.isPending}
                      className="text-muted-foreground"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
