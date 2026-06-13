export const GITHUB_API_BASE = 'https://api.github.com'

export const PERMISSION_LABELS: Record<string, string> = {
  pull: 'Read',
  triage: 'Triage',
  push: 'Write',
  maintain: 'Maintain',
  admin: 'Admin',
}

export const WORKFLOW_STATUS_MAP: Record<string, string> = {
  queued: 'Queued',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export const WORKFLOW_CONCLUSION_MAP: Record<string, string> = {
  success: 'Success',
  failure: 'Failed',
  neutral: 'Neutral',
  cancelled: 'Cancelled',
  skipped: 'Skipped',
  timed_out: 'Timed out',
  action_required: 'Action required',
}

export const REPO_SORT_OPTIONS = [
  { value: 'updated', label: 'Last updated' },
  { value: 'name', label: 'Name' },
  { value: 'stars', label: 'Stars' },
  { value: 'forks', label: 'Forks' },
]

export const REPO_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'owner', label: 'Owner' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'forks', label: 'Forks' },
]
