import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const GITHUB_API = 'https://api.github.com'

const createGithubClient = () => {
  const client = axios.create({
    baseURL: GITHUB_API,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout()
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const githubClient = createGithubClient()

// Repository APIs
export const githubService = {
  // Auth
  async getAuthenticatedUser() {
    const { data } = await githubClient.get('/user')
    return data
  },

  // Repositories
  async getRepositories(params?: { type?: string; sort?: string; direction?: string; per_page?: number; page?: number }) {
    const { data } = await githubClient.get('/user/repos', { params: { per_page: 30, ...params } })
    return data
  },

  async getRepository(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}`)
    return data
  },

  async createRepository(payload: { name: string; description?: string; private?: boolean; auto_init?: boolean }) {
    const { data } = await githubClient.post('/user/repos', payload)
    return data
  },

  async updateRepository(owner: string, repo: string, payload: Partial<{ name: string; description: string; private: boolean; has_issues: boolean; has_wiki: boolean; has_projects: boolean; default_branch: string; archived: boolean }>) {
    const { data } = await githubClient.patch(`/repos/${owner}/${repo}`, payload)
    return data
  },

  async deleteRepository(owner: string, repo: string) {
    await githubClient.delete(`/repos/${owner}/${repo}`)
  },

  // Branches
  async getBranches(owner: string, repo: string, params?: { per_page?: number; page?: number }) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/branches`, { params })
    return data
  },

  async createBranch(owner: string, repo: string, branchName: string, sha: string) {
    const { data } = await githubClient.post(`/repos/${owner}/${repo}/git/refs`, {
      ref: `refs/heads/${branchName}`,
      sha,
    })
    return data
  },

  async deleteBranch(owner: string, repo: string, branchName: string) {
    await githubClient.delete(`/repos/${owner}/${repo}/git/refs/heads/${branchName}`)
  },

  async getDefaultBranchSha(owner: string, repo: string, branch: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/git/refs/heads/${branch}`)
    return data.object.sha
  },

  async getRateLimit() {
  const { data } = await this.api.get('/rate_limit')
  return data.rate
  },

  // Commits
  async getCommits(owner: string, repo: string, params?: { sha?: string; path?: string; per_page?: number; page?: number }) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/commits`, { params })
    return data
  },

  // Pull Requests
  async getPullRequests(owner: string, repo: string, params?: { state?: 'open' | 'closed' | 'all'; per_page?: number; page?: number }) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/pulls`, { params: { state: 'open', per_page: 30, ...params } })
    return data
  },

  async createPullRequest(owner: string, repo: string, payload: { title: string; body?: string; head: string; base: string; draft?: boolean }) {
    const { data } = await githubClient.post(`/repos/${owner}/${repo}/pulls`, payload)
    return data
  },

  async mergePullRequest(owner: string, repo: string, number: number, payload?: { commit_title?: string; commit_message?: string; merge_method?: 'merge' | 'squash' | 'rebase' }) {
    const { data } = await githubClient.put(`/repos/${owner}/${repo}/pulls/${number}/merge`, payload)
    return data
  },

  async updatePullRequest(owner: string, repo: string, number: number, payload: Partial<{ title: string; body: string; state: 'open' | 'closed' }>) {
    const { data } = await githubClient.patch(`/repos/${owner}/${repo}/pulls/${number}`, payload)
    return data
  },

  // Issues
  async getIssues(owner: string, repo: string, params?: { state?: 'open' | 'closed' | 'all'; per_page?: number; page?: number; labels?: string }) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/issues`, { params: { state: 'open', per_page: 30, ...params } })
    return data
  },

  async createIssue(owner: string, repo: string, payload: { title: string; body?: string; labels?: string[]; assignees?: string[] }) {
    const { data } = await githubClient.post(`/repos/${owner}/${repo}/issues`, payload)
    return data
  },

  async updateIssue(owner: string, repo: string, number: number, payload: Partial<{ title: string; body: string; state: 'open' | 'closed'; labels: string[]; assignees: string[] }>) {
    const { data } = await githubClient.patch(`/repos/${owner}/${repo}/issues/${number}`, payload)
    return data
  },

  async getLabels(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/labels`)
    return data
  },

  // Releases
  async getReleases(owner: string, repo: string, params?: { per_page?: number; page?: number }) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/releases`, { params })
    return data
  },

  async createRelease(owner: string, repo: string, payload: { tag_name: string; name?: string; body?: string; draft?: boolean; prerelease?: boolean }) {
    const { data } = await githubClient.post(`/repos/${owner}/${repo}/releases`, payload)
    return data
  },

  async deleteRelease(owner: string, repo: string, releaseId: number) {
    await githubClient.delete(`/repos/${owner}/${repo}/releases/${releaseId}`)
  },

  // Tags
  async getTags(owner: string, repo: string, params?: { per_page?: number; page?: number }) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/tags`, { params })
    return data
  },

  async deleteTag(owner: string, repo: string, tagName: string) {
    await githubClient.delete(`/repos/${owner}/${repo}/git/refs/tags/${tagName}`)
  },

  // Workflows (GitHub Actions)
  async getWorkflows(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/actions/workflows`)
    return data
  },

  async getWorkflowRuns(owner: string, repo: string, params?: { workflow_id?: number | string; per_page?: number; page?: number; status?: string; branch?: string }) {
    const { workflow_id, ...queryParams } = params || {}
    const path = workflow_id
      ? `/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs`
      : `/repos/${owner}/${repo}/actions/runs`
    const { data } = await githubClient.get(path, { params: queryParams })
    return data
  },

  async reRunWorkflow(owner: string, repo: string, runId: number) {
    const { data } = await githubClient.post(`/repos/${owner}/${repo}/actions/runs/${runId}/rerun`)
    return data
  },

  async cancelWorkflowRun(owner: string, repo: string, runId: number) {
    const { data } = await githubClient.post(`/repos/${owner}/${repo}/actions/runs/${runId}/cancel`)
    return data
  },

  async getWorkflowRunLogs(owner: string, repo: string, runId: number) {
    const response = await githubClient.get(`/repos/${owner}/${repo}/actions/runs/${runId}/logs`, {
      responseType: 'arraybuffer',
    })
    return response
  },

  // Files
  async getContents(owner: string, repo: string, path: string = '', ref?: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/contents/${path}`, {
      params: ref ? { ref } : undefined,
    })
    return data
  },

  async getFileContent(owner: string, repo: string, path: string, ref?: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/contents/${path}`, {
      params: ref ? { ref } : undefined,
    })
    return data
  },

  async updateFile(owner: string, repo: string, path: string, payload: { message: string; content: string; sha: string; branch?: string }) {
    const { data } = await githubClient.put(`/repos/${owner}/${repo}/contents/${path}`, {
      ...payload,
      content: btoa(unescape(encodeURIComponent(payload.content))),
    })
    return data
  },

  async createFile(owner: string, repo: string, path: string, payload: { message: string; content: string; branch?: string }) {
    const { data } = await githubClient.put(`/repos/${owner}/${repo}/contents/${path}`, {
      ...payload,
      content: btoa(unescape(encodeURIComponent(payload.content))),
    })
    return data
  },

  async deleteFile(owner: string, repo: string, path: string, payload: { message: string; sha: string; branch?: string }) {
    const { data } = await githubClient.delete(`/repos/${owner}/${repo}/contents/${path}`, {
      data: payload,
    })
    return data
  },

  // Secrets & Variables
  async getRepoPublicKey(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/actions/secrets/public-key`)
    return data
  },

  async getSecrets(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/actions/secrets`)
    return data
  },

  async createOrUpdateSecret(owner: string, repo: string, secretName: string, encryptedValue: string, keyId: string) {
    const { data } = await githubClient.put(`/repos/${owner}/${repo}/actions/secrets/${secretName}`, {
      encrypted_value: encryptedValue,
      key_id: keyId,
    })
    return data
  },

  async deleteSecret(owner: string, repo: string, secretName: string) {
    await githubClient.delete(`/repos/${owner}/${repo}/actions/secrets/${secretName}`)
  },

  async getVariables(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/actions/variables`)
    return data
  },

  async createVariable(owner: string, repo: string, name: string, value: string) {
    const { data } = await githubClient.post(`/repos/${owner}/${repo}/actions/variables`, { name, value })
    return data
  },

  async updateVariable(owner: string, repo: string, name: string, value: string) {
    const { data } = await githubClient.patch(`/repos/${owner}/${repo}/actions/variables/${name}`, { name, value })
    return data
  },

  async deleteVariable(owner: string, repo: string, name: string) {
    await githubClient.delete(`/repos/${owner}/${repo}/actions/variables/${name}`)
  },

  // Webhooks
  async getWebhooks(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/hooks`)
    return data
  },

  async createWebhook(owner: string, repo: string, payload: { url: string; events: string[]; active: boolean; content_type?: string }) {
    const { data } = await githubClient.post(`/repos/${owner}/${repo}/hooks`, {
      name: 'web',
      active: payload.active,
      events: payload.events,
      config: {
        url: payload.url,
        content_type: payload.content_type || 'json',
        insecure_ssl: '0',
      },
    })
    return data
  },

  async deleteWebhook(owner: string, repo: string, hookId: number) {
    await githubClient.delete(`/repos/${owner}/${repo}/hooks/${hookId}`)
  },

  // Collaborators
  async getCollaborators(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/collaborators`)
    return data
  },

  async addCollaborator(owner: string, repo: string, username: string, permission?: string) {
    const { data } = await githubClient.put(`/repos/${owner}/${repo}/collaborators/${username}`, { permission: permission || 'push' })
    return data
  },

  async removeCollaborator(owner: string, repo: string, username: string) {
    await githubClient.delete(`/repos/${owner}/${repo}/collaborators/${username}`)
  },

  // Contributors
  async getContributors(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/contributors`)
    return data
  },

  // Organizations
  async getUserOrgs() {
    const { data } = await githubClient.get('/user/orgs')
    return data
  },

  async getOrgRepos(org: string, params?: { type?: string; per_page?: number; page?: number }) {
    const { data } = await githubClient.get(`/orgs/${org}/repos`, { params })
    return data
  },

  async getOrgMembers(org: string) {
    const { data } = await githubClient.get(`/orgs/${org}/members`)
    return data
  },

  async getOrgTeams(org: string) {
    const { data } = await githubClient.get(`/orgs/${org}/teams`)
    return data
  },

  // Events / Activity
  async getUserEvents(username: string, params?: { per_page?: number; page?: number }) {
    const { data } = await githubClient.get(`/users/${username}/events`, { params })
    return data
  },

  async getRepoEvents(owner: string, repo: string, params?: { per_page?: number }) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/events`, { params })
    return data
  },

  // Repository stats
  async getRepoStats(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/stats/commit_activity`)
    return data
  },

  async getRepoLanguages(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/languages`)
    return data
  },

  async getRepoTraffic(owner: string, repo: string) {
    const { data } = await githubClient.get(`/repos/${owner}/${repo}/traffic/views`)
    return data
  },

  // Search
  async searchRepositories(query: string, params?: { sort?: string; order?: string; per_page?: number; page?: number }) {
    const { data } = await githubClient.get('/search/repositories', { params: { q: query, ...params } })
    return data
  },

  async searchIssues(query: string, params?: { sort?: string; order?: string; per_page?: number; page?: number }) {
    const { data } = await githubClient.get('/search/issues', { params: { q: query, ...params } })
    return data
  },

  async searchUsers(query: string, params?: { per_page?: number; page?: number }) {
    const { data } = await githubClient.get('/search/users', { params: { q: query, ...params } })
    return data
  },

  async searchCode(query: string, params?: { per_page?: number; page?: number }) {
    const { data } = await githubClient.get('/search/code', { params: { q: query, ...params } })
    return data
  },

  // Rate limit
  async getRateLimit() {
    const { data } = await githubClient.get('/rate_limit')
    return data
  },
}
