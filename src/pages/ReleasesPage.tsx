import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tag, Plus, Trash2, Download, Package } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import RepoSelector from '@/components/features/RepoSelector'
import { formatDate, formatBytes } from '@/lib/utils'
import type { Release, Repository } from '@/types'

export default function ReleasesPage() {
  const { success, error: toastError } = useToast()
  const queryClient = useQueryClient()
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newRelease, setNewRelease] = useState({ tag_name: '', name: '', body: '', draft: false, prerelease: false })

  const { data: releases = [], isLoading } = useQuery<Release[]>({
    queryKey: ['releases', selectedRepo?.full_name],
    queryFn: () => githubService.getReleases(selectedRepo!.owner.login, selectedRepo!.name),
    enabled: !!selectedRepo,
  })

  const createMutation = useMutation({
    mutationFn: () => githubService.createRelease(selectedRepo!.owner.login, selectedRepo!.name, newRelease),
    onSuccess: () => {
      success('Release created')
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      setCreateOpen(false)
    },
    onError: (e: any) => toastError('Failed', e?.response?.data?.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => githubService.deleteRelease(selectedRepo!.owner.login, selectedRepo!.name, id),
    onSuccess: () => {
      success('Release deleted')
      queryClient.invalidateQueries({ queryKey: ['releases'] })
    },
  })

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Releases</h1>
          <p className="text-sm text-muted-foreground">Manage repository releases and tags</p>
        </div>
        <Button size="md" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCreateOpen(true)} disabled={!selectedRepo}>
          New release
        </Button>
      </div>

      <div className="w-72">
        <RepoSelector value={selectedRepo?.full_name} onChange={setSelectedRepo} />
      </div>

      {!selectedRepo ? (
        <EmptyState icon={Tag} title="Select a repository" description="Choose a repository to view its releases" />
      ) : isLoading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : releases.length === 0 ? (
        <EmptyState icon={Tag} title="No releases" description="Create your first release" action={{ label: 'New release', onClick: () => setCreateOpen(true) }} />
      ) : (
        <div className="space-y-4">
          {releases.map((release) => (
            <Card key={release.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <a href={release.html_url} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-foreground hover:underline">
                      {release.name || release.tag_name}
                    </a>
                    <code className="text-xs font-mono bg-muted border border-border px-1.5 py-0.5 rounded">{release.tag_name}</code>
                    {release.draft && <Badge variant="warning">Draft</Badge>}
                    {release.prerelease && <Badge variant="info">Pre-release</Badge>}
                    {!release.draft && !release.prerelease && <Badge variant="success">Latest</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <img src={release.author.avatar_url} alt={release.author.login} className="h-4 w-4 rounded-full" />
                    <span>{release.author.login}</span>
                    <span>{formatDate(release.published_at || release.created_at)}</span>
                  </div>
                  {release.body && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{release.body}</p>
                  )}
                  {release.assets.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {release.assets.map((asset) => (
                        <a
                          key={asset.id}
                          href={asset.browser_download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Package className="h-3 w-3 shrink-0" />
                          <span>{asset.name}</span>
                          <span className="text-muted-foreground/60">{formatBytes(asset.size)}</span>
                          <span className="text-muted-foreground/60">· {asset.download_count} downloads</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={release.zipball_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" leftIcon={<Download className="h-3 w-3" />}>
                      ZIP
                    </Button>
                  </a>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(release.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Release"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Publish release</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tag version" value={newRelease.tag_name} onChange={(e) => setNewRelease({ ...newRelease, tag_name: e.target.value })} placeholder="v1.0.0" />
          <Input label="Release title" value={newRelease.name} onChange={(e) => setNewRelease({ ...newRelease, name: e.target.value })} placeholder="Release 1.0.0" />
          <Textarea label="Release notes" value={newRelease.body} onChange={(e) => setNewRelease({ ...newRelease, body: e.target.value })} placeholder="Describe what changed..." className="min-h-[100px]" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newRelease.draft} onChange={(e) => setNewRelease({ ...newRelease, draft: e.target.checked })} />
              <span className="text-sm">Save as draft</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newRelease.prerelease} onChange={(e) => setNewRelease({ ...newRelease, prerelease: e.target.checked })} />
              <span className="text-sm">Pre-release</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
