import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Webhook, Plus, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import RepoSelector from '@/components/features/RepoSelector'
import { formatRelativeTime } from '@/lib/utils'
import type { Repository } from '@/types'

const EVENTS = ['push', 'pull_request', 'issues', 'create', 'delete', 'release', 'workflow_run', 'check_run', 'check_suite', 'deployment']

export default function WebhooksPage() {
  const { success, error: toastError } = useToast()
  const queryClient = useQueryClient()
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newHook, setNewHook] = useState({ url: '', events: ['push'], active: true })

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks', selectedRepo?.full_name],
    queryFn: () => githubService.getWebhooks(selectedRepo!.owner.login, selectedRepo!.name),
    enabled: !!selectedRepo,
  })

  const createMutation = useMutation({
    mutationFn: () => githubService.createWebhook(selectedRepo!.owner.login, selectedRepo!.name, { url: newHook.url, events: newHook.events, active: newHook.active }),
    onSuccess: () => {
      success('Webhook created')
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      setCreateOpen(false)
    },
    onError: (e: any) => toastError('Failed', e?.response?.data?.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => githubService.deleteWebhook(selectedRepo!.owner.login, selectedRepo!.name, id),
    onSuccess: () => {
      success('Webhook deleted')
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })

  const toggleEvent = (event: string) => {
    setNewHook((h) => ({
      ...h,
      events: h.events.includes(event) ? h.events.filter((e) => e !== event) : [...h.events, event],
    }))
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Webhooks</h1>
          <p className="text-sm text-muted-foreground">Configure HTTP callbacks for repository events</p>
        </div>
        <Button size="md" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCreateOpen(true)} disabled={!selectedRepo}>
          Add webhook
        </Button>
      </div>

      <div className="w-72">
        <RepoSelector value={selectedRepo?.full_name} onChange={setSelectedRepo} />
      </div>

      {!selectedRepo ? (
        <EmptyState icon={Webhook} title="Select a repository" description="Choose a repository to manage its webhooks" />
      ) : isLoading ? (
        <SkeletonList />
      ) : webhooks.length === 0 ? (
        <EmptyState icon={Webhook} title="No webhooks" description="Add a webhook to receive repository events" action={{ label: 'Add webhook', onClick: () => setCreateOpen(true) }} />
      ) : (
        <div className="space-y-3">
          {webhooks.map((hook: any) => (
            <Card key={hook.id}>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted shrink-0">
                  {hook.active ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-medium text-foreground truncate">{hook.config?.url}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hook.events?.map((e: string) => (
                      <Badge key={e} variant="default" size="sm">{e}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {hook.active ? 'Active' : 'Inactive'} · {hook.config?.content_type} · Updated {formatRelativeTime(hook.updated_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(hook.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add webhook"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Add webhook</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Payload URL" value={newHook.url} onChange={(e) => setNewHook({ ...newHook, url: e.target.value })} placeholder="https://example.com/webhook" />
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Events</label>
            <div className="grid grid-cols-2 gap-1.5">
              {EVENTS.map((event) => (
                <label key={event} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={newHook.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-border"
                  />
                  <span className="font-mono text-xs text-foreground">{event}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newHook.active} onChange={(e) => setNewHook({ ...newHook, active: e.target.checked })} />
            <span className="text-sm">Active</span>
          </label>
        </div>
      </Modal>
    </div>
  )
}
