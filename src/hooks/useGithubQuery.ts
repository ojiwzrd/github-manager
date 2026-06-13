import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { githubService } from '@/lib/github'
import { useAuthStore } from '@/stores/authStore'

export function useRepositories(type = 'all') {
  return useQuery({
    queryKey: ['repositories', type],
    queryFn: () => githubService.getRepositories({ type, per_page: 100 }),
  })
}

export function useRepository(owner: string, repo: string) {
  return useQuery({
    queryKey: ['repo', owner, repo],
    queryFn: () => githubService.getRepository(owner, repo),
    enabled: !!owner && !!repo,
  })
}

export function useBranches(owner: string, repo: string) {
  return useQuery({
    queryKey: ['branches', owner, repo],
    queryFn: () => githubService.getBranches(owner, repo, { per_page: 100 }),
    enabled: !!owner && !!repo,
  })
}

export function usePullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') {
  return useQuery({
    queryKey: ['prs', owner, repo, state],
    queryFn: () => githubService.getPullRequests(owner, repo, { state, per_page: 50 }),
    enabled: !!owner && !!repo,
  })
}

export function useIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') {
  return useQuery({
    queryKey: ['issues', owner, repo, state],
    queryFn: () => githubService.getIssues(owner, repo, { state, per_page: 50 }),
    enabled: !!owner && !!repo,
  })
}

export function useWorkflowRuns(owner: string, repo: string) {
  return useQuery({
    queryKey: ['workflow-runs', owner, repo],
    queryFn: () => githubService.getWorkflowRuns(owner, repo, { per_page: 30 }),
    enabled: !!owner && !!repo,
    refetchInterval: 15000,
  })
}

export function useCurrentUser() {
  const { user } = useAuthStore()
  return user
}
