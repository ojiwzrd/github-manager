import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, BookOpen, Users, ExternalLink } from 'lucide-react'
import { githubService } from '@/lib/github'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatNumber } from '@/lib/utils'
import type { Organization } from '@/types'

export default function OrganizationsPage() {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)

  const { data: orgs = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: () => githubService.getUserOrgs(),
  })

  const { data: orgRepos = [], isLoading: reposLoading } = useQuery({
    queryKey: ['org-repos', selectedOrg],
    queryFn: () => githubService.getOrgRepos(selectedOrg!, { per_page: 30 }),
    enabled: !!selectedOrg,
  })

  const { data: orgMembers = [] } = useQuery({
    queryKey: ['org-members', selectedOrg],
    queryFn: () => githubService.getOrgMembers(selectedOrg!),
    enabled: !!selectedOrg,
  })

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Organizations</h1>
        <p className="text-sm text-muted-foreground">View and manage your GitHub organizations</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : orgs.length === 0 ? (
        <EmptyState icon={Building2} title="No organizations" description="You are not a member of any organizations" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <Card
              key={org.id}
              hover
              className={`cursor-pointer transition-all ${selectedOrg === org.login ? 'border-foreground/40 ring-1 ring-foreground/20' : ''}`}
              onClick={() => setSelectedOrg(selectedOrg === org.login ? null : org.login)}
            >
              <div className="flex items-center gap-3">
                <img src={org.avatar_url} alt={org.login} className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{org.login}</p>
                  {org.description && <p className="text-xs text-muted-foreground truncate">{org.description}</p>}
                </div>
                <a
                  href={org.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" /> {org.public_repos} repos
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedOrg && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src={orgs.find((o) => o.login === selectedOrg)?.avatar_url} alt={selectedOrg} className="h-6 w-6 rounded-md" />
            <h2 className="text-sm font-semibold text-foreground">{selectedOrg}</h2>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{orgMembers.length} members</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Repositories</p>
              <div className="space-y-2">
                {reposLoading
                  ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                  : orgRepos.slice(0, 10).map((repo: any) => (
                    <a key={repo.id} href={`/repositories/${repo.owner.login}/${repo.name}`}>
                      <Card hover className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{repo.name}</p>
                          {repo.description && <p className="text-xs text-muted-foreground truncate">{repo.description}</p>}
                        </div>
                        <Badge variant={repo.private ? 'warning' : 'success'} size="sm">
                          {repo.private ? 'Private' : 'Public'}
                        </Badge>
                      </Card>
                    </a>
                  ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Members</p>
              <Card padding="none">
                <div className="divide-y divide-border">
                  {orgMembers.slice(0, 10).map((member: any) => (
                    <div key={member.id} className="flex items-center gap-2.5 px-3 py-2.5">
                      <img src={member.avatar_url} alt={member.login} className="h-6 w-6 rounded-full shrink-0" />
                      <p className="text-sm text-foreground truncate">{member.login}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
