import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Grid3X3, List, Star, GitFork, Lock, Globe, Folder, Trash2, Edit2, Copy, Code, MoreHorizontal } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Dropdown from '@/components/ui/Dropdown'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Textarea from '@/components/ui/Textarea'
import { formatRelativeTime, formatNumber, getLanguageColor, copyToClipboard, cn } from '@/lib/utils'
import type { Repository } from '@/types'
import { useNavigate } from 'react-router-dom'

type ViewMode = 'grid' | 'list'
type SortField = 'updated' | 'name' | 'stars' | 'forks'

export default function RepositoriesPage() {
  const { user } = useAuthStore()
  const { success, error: toastError } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sort, setSort] = useState<SortField>('updated')
  const [filter, setFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Repository | null>(null)
  const [renameTarget, setRenameTarget] = useState<Repository | null>(null)

  // Create form
  const [newRepo, setNewRepo] = useState({ name: '', description: '', private: false, auto_init: true })
  const [renameVal, setRenameVal] = useState('')

  const { data: repos = [], isLoading } = useQuery<Repository[]>({
    queryKey: ['repositories', filter],
    queryFn: () => githubService.getRepositories({ type: filter, per_page: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: () => githubService.createRepository(newRepo),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['repositories', filter] })
      const prev = queryClient.getQueryData<Repository[]>(['repositories', filter])
      // optimistic: add placeholder
      queryClient.setQueryData<Repository[]>(['repositories', filter], old => [
        { id: Date.now(), name: newRepo.name, full_name: `.../${newRepo.name}`, description: newRepo.description, private: newRepo.private, owner: { login: '...', avatar_url: '' }, stargazers_count: 0, forks_count: 0, updated_at: new Date().toISOString(), language: null, fork: false, archived: false, clone_url: '', html_url: '', default_branch: 'main' } as Repository,
        ...(old || []),
      ])
      return { prev }
    },
    onSuccess: (data) => {
      success('Repository created')
      queryClient.setQueryData<Repository[]>(['repositories', filter], old =>
        (old || []).map(r => r.name === newRepo.name && r.id === data.id ? data : r)
      )
      setCreateOpen(false)
      setNewRepo({ name: '', description: '', private: false, auto_init: true })
    },
    onError: (e: any, _, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['repositories', filter], ctx.prev)
      toastError('Failed to create', e?.response?.data?.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['repositories'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (repo: Repository) => githubService.deleteRepository(repo.owner.login, repo.name),
    onMutate: async (repo) => {
      await queryClient.cancelQueries({ queryKey: ['repositories', filter] })
      const prev = queryClient.getQueryData<Repository[]>(['repositories', filter])
      queryClient.setQueryData<Repository[]>(['repositories', filter], old =>
        (old || []).filter(r => r.id !== repo.id)
      )
      return { prev }
    },
    onSuccess: () => {
      success('Repository deleted')
      setDeleteTarget(null)
    },
    onError: (e: any, _, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['repositories', filter], ctx.prev)
      toastError('Failed to delete', e?.response?.data?.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['repositories'] }),
  })

  const renameMutation = useMutation({
    mutationFn: (repo: Repository) => githubService.updateRepository(repo.owner.login, repo.name, { name: renameVal }),
    onMutate: async (repo) => {
      await queryClient.cancelQueries({ queryKey: ['repositories', filter] })
      const prev = queryClient.getQueryData<Repository[]>(['repositories', filter])
      queryClient.setQueryData<Repository[]>(['repositories', filter], old =>
        (old || []).map(r => r.id === repo.id ? { ...r, name: renameVal } : r)
      )
      return { prev }
    },
    onSuccess: () => {
      success('Renamed')
      setRenameTarget(null)
    },
    onError: (e: any, _, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['repositories', filter], ctx.prev)
      toastError('Failed to rename', e?.response?.data?.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['repositories'] }),
  })

  const filtered = repos
    .filter((r) => {
      const q = search.toLowerCase()
      return !q || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'stars') return b.stargazers_count - a.stargazers_count
      if (sort === 'forks') return b.forks_count - a.forks_count
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  const getMenuItems = (repo: Repository) => [
    {
      label: 'View files',
      icon: <Folder className="h-3.5 w-3.5" />,
      onClick: () => navigate(`/repositories/${repo.owner.login}/${repo.name}/files`),
    },
    {
      label: 'Copy clone URL',
      icon: <Copy className="h-3.5 w-3.5" />,
      onClick: () => { copyToClipboard(repo.clone_url); success('Copied!') },
    },
    {
      label: 'Rename',
      icon: <Edit2 className="h-3.5 w-3.5" />,
      onClick: () => { setRenameTarget(repo); setRenameVal(repo.name) },
    },
    { separator: true } as any,
    {
      label: 'Delete repository',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: 'destructive' as const,
      onClick: () => setDeleteTarget(repo),
    },
  ]

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Repositories</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {repos.length}</p>
        </div>
        <Button
          size="md"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => setCreateOpen(true)}
        >
          New repo
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            leftIcon={<Search className="h-3.5 w-3.5" />}
          />
        </div>
        <Select
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'owner', label: 'Owner' },
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' },
            { value: 'forks', label: 'Forks' },
          ]}
          className="w-32"
        />
        <Select
          value={sort}
          onChange={(v) => setSort(v as SortField)}
          options={[
            { value: 'updated', label: 'Last updated' },
            { value: 'name', label: 'Name' },
            { value: 'stars', label: 'Stars' },
            { value: 'forks', label: 'Forks' },
          ]}
          className="w-36"
        />
        <div className="flex items-center rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={cn('h-8 px-2.5 transition-colors', viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn('h-8 px-2.5 transition-colors', viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Repository list */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Code}
          title="No repositories found"
          description={search ? `No repositories matching "${search}"` : 'Create your first repository to get started.'}
          action={{ label: 'New repository', onClick: () => setCreateOpen(true) }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((repo) => (
            <Card key={repo.id} hover className="flex flex-col gap-3 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a href={`/repositories/${repo.owner.login}/${repo.name}`} className="text-sm font-semibold text-foreground hover:underline truncate block">
                    {repo.name}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={repo.private ? 'warning' : 'success'} size="sm">
                    {repo.private ? 'Private' : 'Public'}
                  </Badge>
                  <Dropdown trigger={<button className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-3.5 w-3.5" /></button>} items={getMenuItems(repo)} align="right" />
                </div>
              </div>
              {repo.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{repo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border">
                {repo.language && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: getLanguageColor(repo.language) }} />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" /> {formatNumber(repo.stargazers_count)}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GitFork className="h-3 w-3" /> {formatNumber(repo.forks_count)}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(repo.updated_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((repo) => (
              <div key={repo.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-accent/50 transition-colors group">
                <div className="flex items-center justify-center h-7 w-7 rounded-md bg-muted shrink-0">
                  {repo.private ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : <Globe className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a href={`/repositories/${repo.owner.login}/${repo.name}`} className="text-sm font-medium text-foreground hover:underline">
                      {repo.owner.login !== user?.login ? `${repo.owner.login}/` : ''}{repo.name}
                    </a>
                    {repo.fork && <Badge variant="outline" size="sm">Fork</Badge>}
                    {repo.archived && <Badge variant="default" size="sm">Archived</Badge>}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-muted-foreground truncate">{repo.description}</p>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  {repo.language && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ background: getLanguageColor(repo.language) }} />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground w-12">
                    <Star className="h-3 w-3" /> {formatNumber(repo.stargazers_count)}
                  </span>
                  <span className="text-xs text-muted-foreground w-20 text-right">{formatRelativeTime(repo.updated_at)}</span>
                </div>
                <Dropdown
                  trigger={
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  }
                  items={getMenuItems(repo)}
                  align="right"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New repository"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Create repository</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Repository name"
            value={newRepo.name}
            onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
            placeholder="my-awesome-project"
          />
          <Textarea
            label="Description (optional)"
            value={newRepo.description}
            onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
            placeholder="A short description of your repository"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setNewRepo({ ...newRepo, private: false })}
                className={cn('flex items-center gap-2.5 p-3 rounded-lg border text-left transition-colors', !newRepo.private ? 'border-foreground/40 bg-accent' : 'border-border hover:bg-accent/50')}
              >
                <Globe className="h-4 w-4 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone can see</p>
                </div>
              </button>
              <button
                onClick={() => setNewRepo({ ...newRepo, private: true })}
                className={cn('flex items-center gap-2.5 p-3 rounded-lg border text-left transition-colors', newRepo.private ? 'border-foreground/40 bg-accent' : 'border-border hover:bg-accent/50')}
              >
                <Lock className="h-4 w-4 text-yellow-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Private</p>
                  <p className="text-xs text-muted-foreground">Only you can see</p>
                </div>
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newRepo.auto_init}
              onChange={(e) => setNewRepo({ ...newRepo, auto_init: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Initialize with README</span>
          </label>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete repository"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending}>
              Delete permanently
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong>{deleteTarget?.full_name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All branches, commits, and data will be permanently deleted.
          </p>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        open={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="Rename repository"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={() => renameTarget && renameMutation.mutate(renameTarget)} loading={renameMutation.isPending}>
              Rename
            </Button>
          </>
        }
      >
        <Input
          label="New name"
          value={renameVal}
          onChange={(e) => setRenameVal(e.target.value)}
        />
      </Modal>
    </div>
  )
}
