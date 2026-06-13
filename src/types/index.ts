export interface User {
  id: string
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  html_url: string
}

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  clone_url: string
  ssh_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  watchers_count: number
  default_branch: string
  updated_at: string
  created_at: string
  pushed_at: string
  size: number
  topics: string[]
  visibility: 'public' | 'private'
  archived: boolean
  fork: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

export interface Branch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface Commit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    avatar_url: string
  } | null
  html_url: string
}

export interface PullRequest {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed' | 'merged'
  user: {
    login: string
    avatar_url: string
  }
  head: { ref: string; sha: string }
  base: { ref: string; sha: string }
  created_at: string
  updated_at: string
  merged_at: string | null
  closed_at: string | null
  html_url: string
  draft: boolean
  comments: number
  review_comments: number
  commits: number
  additions: number
  deletions: number
  changed_files: number
  labels: Label[]
  mergeable: boolean | null
}

export interface Issue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  user: {
    login: string
    avatar_url: string
  }
  assignees: Array<{ login: string; avatar_url: string }>
  labels: Label[]
  created_at: string
  updated_at: string
  closed_at: string | null
  html_url: string
  comments: number
}

export interface Label {
  id: number
  name: string
  color: string
  description: string | null
}

export interface Release {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string | null
  author: {
    login: string
    avatar_url: string
  }
  html_url: string
  tarball_url: string
  zipball_url: string
  assets: ReleaseAsset[]
}

export interface ReleaseAsset {
  id: number
  name: string
  size: number
  download_count: number
  browser_download_url: string
}

export interface Workflow {
  id: number
  name: string
  state: 'active' | 'deleted' | 'disabled_fork' | 'disabled_inactivity' | 'disabled_manually'
  path: string
  created_at: string
  updated_at: string
  html_url: string
}

export interface WorkflowRun {
  id: number
  name: string | null
  workflow_id: number
  status: 'queued' | 'in_progress' | 'completed' | null
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null
  event: string
  branch: string
  head_sha: string
  created_at: string
  updated_at: string
  run_number: number
  run_attempt: number
  html_url: string
  actor: {
    login: string
    avatar_url: string
  }
  triggering_actor: {
    login: string
    avatar_url: string
  }
  head_commit: {
    message: string
    author: { name: string }
  }
  display_title: string
  run_started_at: string
  updated_at_diff?: string
}

export interface FileItem {
  name: string
  path: string
  sha: string
  size: number
  type: 'file' | 'dir' | 'symlink'
  url: string
  download_url: string | null
  html_url: string
}

export interface FileContent {
  name: string
  path: string
  sha: string
  size: number
  content: string
  encoding: string
  type: 'file'
  html_url: string
}

export interface Secret {
  name: string
  created_at: string
  updated_at: string
}

export interface Variable {
  name: string
  value: string
  created_at: string
  updated_at: string
}

export interface Collaborator {
  login: string
  id: number
  avatar_url: string
  html_url: string
  role_name: string
  permissions: {
    admin: boolean
    maintain: boolean
    push: boolean
    triage: boolean
    pull: boolean
  }
}

export interface Organization {
  id: number
  login: string
  description: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  total_private_repos: number
  members_count?: number
  teams_count?: number
}

export interface Contributor {
  login: string
  id: number
  avatar_url: string
  html_url: string
  contributions: number
  type: string
}

export interface Tag {
  name: string
  commit: {
    sha: string
    url: string
  }
  zipball_url: string
  tarball_url: string
  node_id: string
}

export interface Webhook {
  id: number
  name: string
  active: boolean
  events: string[]
  config: {
    url: string
    content_type: string
    insecure_ssl: string
  }
  created_at: string
  updated_at: string
}

export interface SearchResult {
  total_count: number
  incomplete_results: boolean
  items: Repository[] | Issue[] | PullRequest[] | User[] | Commit[]
}

export type ThemeMode = 'light' | 'dark' | 'system'
export type ViewMode = 'grid' | 'list'
export type SortOrder = 'asc' | 'desc'
export type SortField = 'name' | 'updated' | 'created' | 'stars' | 'forks'
