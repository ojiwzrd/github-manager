import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', options || { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return formatDate(date)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Shell: '#89e051',
    Dockerfile: '#384d54',
    YAML: '#cb171e',
    JSON: '#292929',
    Markdown: '#083fa1',
    Scala: '#c22d40',
    Elixir: '#6e4a7e',
    Haskell: '#5e5086',
    Lua: '#000080',
    R: '#198ce7',
  }
  return colors[language || ''] || '#8b8b8b'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getFileLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', go: 'go', rs: 'rust', java: 'java', cpp: 'cpp', c: 'c',
    cs: 'csharp', rb: 'ruby', php: 'php', swift: 'swift', kt: 'kotlin',
    dart: 'dart', html: 'html', css: 'css', scss: 'scss', sass: 'scss',
    vue: 'html', sh: 'shell', bash: 'shell', zsh: 'shell',
    yml: 'yaml', yaml: 'yaml', json: 'json', md: 'markdown', mdx: 'markdown',
    toml: 'toml', xml: 'xml', sql: 'sql', graphql: 'graphql', dockerfile: 'dockerfile',
    txt: 'plaintext', env: 'plaintext', gitignore: 'plaintext',
  }
  return map[ext] || 'plaintext'
}

export function isTextFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const textExts = ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'cs', 'rb', 'php', 'swift', 'kt', 'dart', 'html', 'css', 'scss', 'sass', 'vue', 'sh', 'bash', 'zsh', 'yml', 'yaml', 'json', 'md', 'mdx', 'toml', 'xml', 'sql', 'graphql', 'txt', 'env', 'gitignore', 'gitattributes', 'editorconfig', 'nvmrc', 'lock', 'log']
  return textExts.includes(ext)
}

export function decodeBase64Content(content: string): string {
  try {
    return decodeURIComponent(escape(atob(content.replace(/\n/g, ''))))
  } catch {
    return atob(content.replace(/\n/g, ''))
  }
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text)
}

export function getStatusColor(status: string | null | undefined) {
  switch (status) {
    case 'completed': return 'success'
    case 'in_progress': return 'yellow'
    case 'queued': return 'blue'
    case 'failure': return 'red'
    case 'success': return 'green'
    case 'cancelled': return 'gray'
    default: return 'gray'
  }
}
