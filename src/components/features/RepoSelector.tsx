import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Search, BookOpen, Lock, Globe } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useAuthStore } from '@/stores/authStore'
import type { Repository } from '@/types'
import { cn } from '@/lib/utils'

interface RepoSelectorProps {
  value?: string
  onChange: (repo: Repository) => void
  placeholder?: string
}

export default function RepoSelector({ value, onChange, placeholder = 'Select repository' }: RepoSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { user } = useAuthStore()

  const { data: repos = [] } = useQuery<Repository[]>({
    queryKey: ['repos-selector'],
    queryFn: () => githubService.getRepositories({ per_page: 100, sort: 'updated' }),
    enabled: open,
  })

  const filtered = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 h-8 px-3 rounded-md border border-input bg-background text-sm transition-colors w-full',
          value ? 'text-foreground' : 'text-muted-foreground',
          'hover:bg-accent'
        )}
      >
        <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left truncate">{value || placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-80 bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repositories..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">No repositories found</p>
            ) : (
              filtered.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => { onChange(repo); setOpen(false); setSearch('') }}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
                    value === repo.full_name && 'bg-accent'
                  )}
                >
                  {repo.private
                    ? <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    : <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <span className="flex-1 truncate text-foreground">{repo.full_name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
