import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Plus,
  Trash2,
  Save,
  X,
  PanelLeft,
  Image,
  Music,
  Video,
  FileText,
  RefreshCw,
  FileCode,
  AlertCircle,
  MoreHorizontal,
  FilePlus,
  GitBranch,
  FolderPlus
} from 'lucide-react'
import { githubService } from '@/lib/github'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { decodeBase64Content, getFileLanguage, cn } from '@/lib/utils'
import type { FileItem, FileContent, Branch } from '@/types'

import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { python } from '@codemirror/lang-python'
import { markdown } from '@codemirror/lang-markdown'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'avif']
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac']
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'avi', 'mkv']
const TEXT_EXTS = [
  'ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'cs', 'rb',
  'php', 'swift', 'kt', 'dart', 'html', 'css', 'scss', 'sass', 'vue', 'sh',
  'bash', 'zsh', 'yml', 'yaml', 'json', 'md', 'mdx', 'toml', 'xml', 'sql',
  'graphql', 'txt', 'env', 'gitignore', 'gitattributes', 'editorconfig',
  'nvmrc', 'lock', 'log', 'tf', 'hcl', 'svelte', 'astro', 'prisma',
]

function getExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || ''
}
function isImage(name: string) { return IMAGE_EXTS.includes(getExt(name)) }
function isAudio(name: string) { return AUDIO_EXTS.includes(getExt(name)) }
function isVideo(name: string) { return VIDEO_EXTS.includes(getExt(name)) }
function isText(name: string) { return TEXT_EXTS.includes(getExt(name)) }

function fileIcon(name: string) {
  if (isImage(name)) return <Image className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
  if (isAudio(name)) return <Music className="h-3.5 w-3.5 text-green-400 shrink-0" />
  if (isVideo(name)) return <Video className="h-3.5 w-3.5 text-purple-400 shrink-0" />
  const ext = getExt(name)
  if (['ts', 'tsx'].includes(ext)) return <FileCode className="h-3.5 w-3.5 text-blue-400 shrink-0" />
  if (['js', 'jsx'].includes(ext)) return <FileCode className="h-3.5 w-3.5 text-yellow-300 shrink-0" />
  if (ext === 'json') return <FileCode className="h-3.5 w-3.5 text-orange-400 shrink-0" />
  if (['md', 'mdx'].includes(ext)) return <FileText className="h-3.5 w-3.5 text-blue-300 shrink-0" />
  if (['yml', 'yaml'].includes(ext)) return <FileCode className="h-3.5 w-3.5 text-red-400 shrink-0" />
  return <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
}

interface OpenTab {
  path: string
  name: string
  sha: string
  content: string
  dirty: boolean
  fileSha: string
  type: 'text' | 'image' | 'audio' | 'video' | 'binary'
  mimeBase64?: string
}

interface TreeProps {
  owner: string
  repo: string
  branch: string
  path: string
  depth: number
  onOpen: (file: FileItem) => void
  activeFile?: string
  onDelete: (file: FileItem) => void
  onCreateFolder: (currentPath: string) => void
  onCreateFile: (currentPath: string) => void
  onRename: (item: FileItem, newName: string) => void
}

function FileTreeNode({ owner, repo, branch, path, depth, onOpen, activeFile, onDelete, onCreateFolder, onCreateFile, onRename }: TreeProps) {
  const [expanded, setExpanded] = useState(depth === 0)

  const { data: items = [], isLoading } = useQuery<FileItem[]>({
    queryKey: ['tree', owner, repo, path, branch],
    queryFn: async () => {
      const data = await githubService.getContents(owner, repo, path, branch)
      return (Array.isArray(data) ? data : [data]).sort((a: FileItem, b: FileItem) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1
        if (a.type !== 'dir' && b.type === 'dir') return 1
        return a.name.localeCompare(b.name)
      })
    },
    enabled: expanded,
  })

  if (depth === 0) {
    return (
      <div className="py-1">
        {isLoading && (
          <div className="space-y-1 px-2">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        )}
        {items.map(item => (
          <TreeItem
            key={item.sha + item.path}
            item={item}
            owner={owner}
            repo={repo}
            branch={branch}
            depth={depth}
            onOpen={onOpen}
            activeFile={activeFile}
            onDelete={onDelete}
            onCreateFolder={onCreateFolder}
            onCreateFile={onCreateFile}
            onRename={onRename}
          />
        ))}
      </div>
    )
  }

  return null
}

interface TreeItemProps {
  item: FileItem
  owner: string
  repo: string
  branch: string
  depth: number
  onOpen: (file: FileItem) => void
  activeFile?: string
  onDelete: (file: FileItem) => void
  onCreateFolder: (currentPath: string) => void
  onCreateFile: (currentPath: string) => void
  onRename: (item: FileItem, newName: string) => void
}

function TreeItem({ item, owner, repo, branch, depth, onOpen, activeFile, onDelete, onCreateFolder, onCreateFile, onRename }: TreeItemProps) {
  const [open, setOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: children = [], isLoading } = useQuery<FileItem[]>({
    queryKey: ['tree', owner, repo, item.path, branch],
    queryFn: async () => {
      const data = await githubService.getContents(owner, repo, item.path, branch)
      return (Array.isArray(data) ? data : [data]).sort((a: FileItem, b: FileItem) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1
        if (a.type !== 'dir' && b.type === 'dir') return 1
        return a.name.localeCompare(b.name)
      })
    },
    enabled: item.type === 'dir' && open,
  })

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditName(item.name)
  }

  const handleRenameSubmit = async () => {
    if (editName && editName !== item.name) {
      onRename(item, editName)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditName(item.name)
    }
  }

  const indent = depth * 12 + 8

  if (item.type === 'dir') {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-1 pr-2 hover:bg-accent cursor-pointer text-muted-foreground hover:text-foreground transition-colors group relative"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => setOpen(o => !o)}
          onDoubleClick={handleDoubleClick}
        >
          <ChevronRight className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-90')} />
          <Folder className="h-3.5 w-3.5 shrink-0 text-blue-400" />
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-xs bg-background border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <span className="text-xs truncate flex-1">{item.name}</span>
          )}
          <div className="relative" ref={menuRef}>
            <button
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-foreground transition-all"
              onClick={e => { e.stopPropagation(); setShowMenu(s => !s) }}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-5 z-50 w-32 rounded-md border border-border bg-popover shadow-lg py-1">
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent"
                  onClick={e => { e.stopPropagation(); setShowMenu(false); onCreateFile(item.path) }}
                >
                  <FilePlus className="h-3 w-3" /> New file
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent"
                  onClick={e => { e.stopPropagation(); setShowMenu(false); onCreateFolder(item.path) }}
                >
                  <FolderPlus className="h-3 w-3" /> New folder
                </button>
              </div>
            )}
          </div>
        </div>
        {open && (
          <div>
            {isLoading && <div className="pl-8 py-1"><Skeleton className="h-4 w-3/4" /></div>}
            {children.map(child => (
              <TreeItem
                key={child.sha + child.path}
                item={child}
                owner={owner}
                repo={repo}
                branch={branch}
                depth={depth + 1}
                onOpen={onOpen}
                activeFile={activeFile}
                onDelete={onDelete}
                onCreateFolder={onCreateFolder}
                onCreateFile={onCreateFile}
                onRename={onRename}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 py-1 pr-2 cursor-pointer transition-colors group relative',
        activeFile === item.path
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      )}
      style={{ paddingLeft: `${indent}px` }}
      onClick={() => onOpen(item)}
      onDoubleClick={handleDoubleClick}
    >
      {fileIcon(item.name)}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-xs bg-background border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <span className="text-xs truncate flex-1">{item.name}</span>
      )}
      <div className="relative" ref={menuRef}>
        <button
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-foreground transition-all"
          onClick={e => { e.stopPropagation(); setShowMenu(s => !s) }}
        >
          <MoreHorizontal className="h-3 w-3" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-5 z-50 w-32 rounded-md border border-border bg-popover shadow-lg py-1">
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-destructive hover:bg-accent"
              onClick={e => { e.stopPropagation(); setShowMenu(false); onDelete(item) }}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FileManagerPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const { success, error: toastError } = useToast()
  const queryClient = useQueryClient()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tabs, setTabs] = useState<OpenTab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [branch, setBranch] = useState('')
  const [branchDropdown, setBranchDropdown] = useState(false)
  const [commitMsg, setCommitMsg] = useState('')
  const [createModal, setCreateModal] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null)
  const [commitModal, setCommitModal] = useState(false)
  const [folderModal, setFolderModal] = useState(false)
  const [newFolderPath, setNewFolderPath] = useState('')
  const [currentFolderPath, setCurrentFolderPath] = useState('')
  const [fileModal, setFileModal] = useState(false)
  const [newFilePath, setNewFilePath] = useState('')
  const [currentFilePath, setCurrentFilePath] = useState('')
  const branchRef = useRef<HTMLDivElement>(null)
  const isDark = document.documentElement.classList.contains('dark')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) setBranchDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['branches', owner, repo],
    queryFn: () => githubService.getBranches(owner!, repo!, { per_page: 100 }),
    enabled: !!owner && !!repo,
  })

  const { data: repoInfo } = useQuery({
    queryKey: ['repo-info', owner, repo],
    queryFn: () => githubService.getRepository(owner!, repo!),
    enabled: !!owner && !!repo,
  })

  useEffect(() => {
    if (repoInfo && !branch) setBranch(repoInfo.default_branch || 'main')
  }, [repoInfo, branch])

  const currentTab = tabs.find(t => t.path === activeTab) ?? null

  const openFile = useCallback(async (file: FileItem) => {
    if (tabs.find(t => t.path === file.path)) {
      setActiveTab(file.path)
      return
    }

    try {
      const data = await githubService.getFileContent(owner!, repo!, file.path, branch)
      const rawBase64 = (data.content || '').replace(/\n/g, '')
      const name = file.name

      let tab: OpenTab

      if (isImage(name)) {
        const ext = getExt(name)
        const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : `image/${ext}`
        tab = {
          path: file.path, name, sha: file.sha,
          content: '', dirty: false, fileSha: data.sha,
          type: 'image',
          mimeBase64: `data:${mime};base64,${rawBase64}`,
        }
      } else if (isAudio(name)) {
        const mime = `audio/${getExt(name)}`
        tab = {
          path: file.path, name, sha: file.sha,
          content: '', dirty: false, fileSha: data.sha,
          type: 'audio',
          mimeBase64: `data:${mime};base64,${rawBase64}`,
        }
      } else if (isVideo(name)) {
        const mime = `video/${getExt(name)}`
        tab = {
          path: file.path, name, sha: file.sha,
          content: '', dirty: false, fileSha: data.sha,
          type: 'video',
          mimeBase64: `data:${mime};base64,${rawBase64}`,
        }
      } else if (isText(name)) {
        const decoded = decodeBase64Content(rawBase64)
        tab = {
          path: file.path, name, sha: file.sha,
          content: decoded, dirty: false, fileSha: data.sha,
          type: 'text',
        }
        setCommitMsg(`Update ${name}`)
      } else {
        tab = {
          path: file.path, name, sha: file.sha,
          content: `Binary file: ${name}\nSize: ${data.size} bytes\nSHA: ${data.sha}`,
          dirty: false, fileSha: data.sha,
          type: 'binary',
        }
      }

      setTabs(prev => [...prev, tab])
      setActiveTab(file.path)
    } catch {
      toastError('Failed to load file')
    }
  }, [tabs, owner, repo, branch, toastError])

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const idx = tabs.findIndex(t => t.path === path)
    setTabs(prev => prev.filter(t => t.path !== path))
    if (activeTab === path) {
      const remaining = tabs.filter(t => t.path !== path)
      setActiveTab(remaining[Math.min(idx, remaining.length - 1)]?.path ?? null)
    }
  }

  const updateTabContent = (content: string) => {
    setTabs(prev => prev.map(t => t.path === activeTab ? { ...t, content, dirty: true } : t))
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!currentTab || currentTab.type !== 'text') throw new Error('No text file')
      return githubService.updateFile(owner!, repo!, currentTab.path, {
        message: commitMsg || `Update ${currentTab.name}`,
        content: currentTab.content,
        sha: currentTab.fileSha,
        branch,
      })
    },
    onSuccess: (data) => {
      success('Saved')
      setCommitModal(false)
      setTabs(prev => prev.map(t =>
        t.path === activeTab ? { ...t, dirty: false, fileSha: data.content.sha } : t
      ))
      queryClient.invalidateQueries({ queryKey: ['tree', owner, repo] })
    },
    onError: () => toastError('Failed to save file'),
  })

  const createMutation = useMutation({
    mutationFn: () => githubService.createFile(owner!, repo!, newFileName, {
      message: `Create ${newFileName}`,
      content: '',
      branch,
    }),
    onSuccess: (data) => {
      success('File created')
      setCreateModal(false)
      setNewFileName('')
      queryClient.invalidateQueries({ queryKey: ['tree', owner, repo] })
      openFile({
        name: data.content.name,
        path: data.content.path,
        sha: data.content.sha,
        type: 'file',
        size: 0,
        url: data.content.url,
        html_url: data.content.html_url,
        git_url: data.content.git_url,
        download_url: data.content.download_url,
      })
    },
    onError: () => toastError('Failed to create file'),
  })

  const createFolderMutation = useMutation({
    mutationFn: async () => {
      const folderPath = currentFolderPath ? `${currentFolderPath}/${newFolderPath}/.gitkeep` : `${newFolderPath}/.gitkeep`
      return githubService.createFile(owner!, repo!, folderPath, {
        message: `Create folder ${newFolderPath}`,
        content: btoa(''),
        branch,
      })
    },
    onSuccess: () => {
      success('Folder created')
      setFolderModal(false)
      setNewFolderPath('')
      setCurrentFolderPath('')
      queryClient.invalidateQueries({ queryKey: ['tree', owner, repo] })
    },
    onError: () => toastError('Failed to create folder'),
  })

  const createFileInFolderMutation = useMutation({
    mutationFn: async () => {
      const filePath = currentFilePath ? `${currentFilePath}/${newFilePath}` : newFilePath
      return githubService.createFile(owner!, repo!, filePath, {
        message: `Create file ${newFilePath}`,
        content: btoa(''),
        branch,
      })
    },
    onSuccess: (data) => {
      success('File created')
      setFileModal(false)
      setNewFilePath('')
      setCurrentFilePath('')
      queryClient.invalidateQueries({ queryKey: ['tree', owner, repo] })
      openFile({
        name: data.content.name,
        path: data.content.path,
        sha: data.content.sha,
        type: 'file',
        size: 0,
        url: data.content.url,
        html_url: data.content.html_url,
        git_url: data.content.git_url,
        download_url: data.content.download_url,
      })
    },
    onError: () => toastError('Failed to create file'),
  })

  const renameMutation = useMutation({
    mutationFn: async ({ item, newName }: { item: FileItem; newName: string }) => {
      const oldPath = item.path
      const pathParts = oldPath.split('/')
      pathParts[pathParts.length - 1] = newName
      const newPath = pathParts.join('/')
      
      const content = await githubService.getFileContent(owner!, repo!, oldPath, branch)
      const rawBase64 = (content.content || '').replace(/\n/g, '')
      
      await githubService.createFile(owner!, repo!, newPath, {
        message: `Rename ${item.name} to ${newName}`,
        content: rawBase64,
        branch,
      })
      
      await githubService.deleteFile(owner!, repo!, oldPath, {
        message: `Delete old file ${item.name}`,
        sha: item.sha,
        branch,
      })
      
      return { oldPath, newPath }
    },
    onSuccess: ({ oldPath, newPath }) => {
      success('Renamed successfully')
      queryClient.invalidateQueries({ queryKey: ['tree', owner, repo] })
      
      setTabs(prev => prev.map(tab => 
        tab.path === oldPath ? { ...tab, path: newPath, name: newPath.split('/').pop() || tab.name } : tab
      ))
      if (activeTab === oldPath) {
        setActiveTab(newPath)
      }
    },
    onError: () => toastError('Failed to rename'),
  })

  const deleteMutation = useMutation({
    mutationFn: (file: FileItem) => githubService.deleteFile(owner!, repo!, file.path, {
      message: `Delete ${file.name}`,
      sha: file.sha,
      branch,
    }),
    onSuccess: (_, file) => {
      success('Deleted')
      setDeleteTarget(null)
      setTabs(prev => prev.filter(t => t.path !== file.path))
      if (activeTab === file.path) setActiveTab(null)
      queryClient.invalidateQueries({ queryKey: ['tree', owner, repo] })
    },
    onError: () => toastError('Failed to delete'),
  })

  const openCreateFolderModal = (currentPath: string = '') => {
    setCurrentFolderPath(currentPath)
    setNewFolderPath('')
    setFolderModal(true)
  }

  const openCreateFileModal = (currentPath: string = '') => {
    setCurrentFilePath(currentPath)
    setNewFilePath('')
    setFileModal(true)
  }

  const handleRename = (item: FileItem, newName: string) => {
    renameMutation.mutate({ item, newName })
  }

  const getExtensions = (filename: string) => {
    const lang = getFileLanguage(filename)
    switch (lang) {
      case 'javascript':
      case 'typescript':
        return [javascript({ jsx: true, typescript: lang === 'typescript' })]
      case 'html':
        return [html()]
      case 'css':
        return [css()]
      case 'json':
        return [json()]
      case 'python':
        return [python()]
      case 'markdown':
        return [markdown()]
      case 'sql':
        return [sql()]
      default:
        return []
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground transition-colors"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-sm font-medium overflow-hidden">
            <span className="text-muted-foreground shrink-0">{owner} / {repo}</span>
            <span className="text-muted-foreground shrink-0">/</span>
            <div className="relative" ref={branchRef}>
              <button
                onClick={() => setBranchDropdown(!branchDropdown)}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors"
              >
                <GitBranch className="h-3.5 w-3.5 text-blue-500" />
                <span className="truncate max-w-[120px]">{branch || '...'}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
              {branchDropdown && (
                <div className="absolute left-0 top-8 z-50 w-48 rounded-md border border-border bg-popover shadow-lg py-1 max-h-64 overflow-y-auto">
                  {branches.map(b => (
                    <button
                      key={b.name}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-accent',
                        branch === b.name && 'text-primary font-medium'
                      )}
                      onClick={() => { setBranch(b.name); setBranchDropdown(false); setTabs([]); setActiveTab(null) }}
                    >
                      <GitBranch className="h-3 w-3" /> {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentTab?.dirty && (
            <button
              onClick={() => setCommitModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        <div className={cn(
          'flex flex-col border-r border-border bg-[hsl(var(--sidebar-bg))] shrink-0 transition-all duration-200 overflow-hidden',
          sidebarOpen ? 'w-56' : 'w-0'
        )}>
          {sidebarOpen && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explorer</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openCreateFolderModal('')}
                    className="text-muted-foreground hover:text-foreground"
                    title="New folder"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => openCreateFileModal('')}
                    className="text-muted-foreground hover:text-foreground"
                    title="New file"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto text-sm">
                {branch ? (
                  <FileTreeNode
                    owner={owner!}
                    repo={repo!}
                    branch={branch}
                    path=""
                    depth={0}
                    onOpen={openFile}
                    activeFile={activeTab ?? undefined}
                    onDelete={setDeleteTarget}
                    onCreateFolder={openCreateFolderModal}
                    onCreateFile={openCreateFileModal}
                    onRename={handleRename}
                  />
                ) : (
                  <div className="space-y-1 p-2">
                    {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {tabs.length > 0 && (
            <div className="flex items-center overflow-x-auto border-b border-border bg-[hsl(var(--sidebar-bg))] shrink-0 h-9 scrollbar-none">
              {tabs.map(tab => (
                <button
                  key={tab.path}
                  onClick={() => setActiveTab(tab.path)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 h-full border-r border-border text-xs whitespace-nowrap shrink-0 transition-colors group',
                    activeTab === tab.path
                      ? 'bg-background text-foreground border-b-2 border-b-primary -mb-px'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {fileIcon(tab.name)}
                  <span className="max-w-[120px] truncate">{tab.name}</span>
                  {tab.dirty && <span className="text-yellow-400 text-[10px]">●</span>}
                  <span
                    role="button"
                    onClick={e => closeTab(tab.path, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive ml-0.5 flex items-center"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {!currentTab ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                <FileCode className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Open a file from the explorer</p>
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <PanelLeft className="h-3.5 w-3.5" /> Show explorer
                  </button>
                )}
              </div>
            ) : currentTab.type === 'image' ? (
              <div className="flex flex-col items-center justify-center h-full overflow-auto p-4 gap-3">
                <img
                  src={currentTab.mimeBase64}
                  alt={currentTab.name}
                  className="max-w-full max-h-[70vh] object-contain rounded border border-border shadow-sm"
                  draggable={false}
                />
                <p className="text-xs text-muted-foreground">{currentTab.name}</p>
              </div>
            ) : currentTab.type === 'audio' ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                <Music className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">{currentTab.name}</p>
                <audio controls src={currentTab.mimeBase64} className="w-full max-w-md" />
              </div>
            ) : currentTab.type === 'video' ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                <video
                  controls
                  src={currentTab.mimeBase64}
                  className="max-w-full max-h-[80vh] rounded border border-border"
                />
                <p className="text-xs text-muted-foreground">{currentTab.name}</p>
              </div>
            ) : currentTab.type === 'binary' ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">Binary file</p>
                <pre className="text-xs text-muted-foreground bg-muted rounded p-3 max-w-sm w-full text-left">{currentTab.content}</pre>
              </div>
            ) : (
              <CodeMirror
                value={currentTab.content}
                height="100%"
                theme={isDark ? oneDark : 'light'}
                extensions={getExtensions(currentTab.name)}
                onChange={(val) => updateTabContent(val)}
                className="h-full text-[13px]"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  foldGutter: true,
                  highlightSelectionMatches: true,
                  tabSize: 2,
                }}
              />
            )}
          </div>

          <div className="flex items-center justify-between px-3 h-5 border-t border-border bg-primary text-primary-foreground text-[10px] shrink-0">
            <div className="flex items-center gap-3">
              <span>{owner}/{repo}</span>
              <span className="opacity-60">›</span>
              <span>{branch}</span>
              {currentTab && (
                <>
                  <span className="opacity-60">›</span>
                  <span className="opacity-80 truncate max-w-[200px]">{currentTab.path}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 opacity-80">
              {currentTab?.type === 'text' && (
                <span>{getFileLanguage(currentTab.name)}</span>
              )}
              {currentTab?.dirty && <span className="text-yellow-300">● unsaved</span>}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={commitModal}
        onClose={() => setCommitModal(false)}
        title="Commit changes"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCommitModal(false)}>Cancel</Button>
            <Button size="sm" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
              Commit & push
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Committing <span className="font-medium text-foreground">{currentTab?.name}</span> to <span className="font-mono">{branch}</span>
          </p>
          <Input
            label="Commit message"
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
            placeholder="Describe your changes..."
            autoFocus
          />
        </div>
      </Modal>

      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="New file"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!newFileName.trim()}>
              Create
            </Button>
          </>
        }
      >
        <Input
          label="File path"
          value={newFileName}
          onChange={e => setNewFileName(e.target.value)}
          placeholder="e.g. src/components/Button.tsx"
          autoFocus
        />
      </Modal>

      <Modal
        open={folderModal}
        onClose={() => setFolderModal(false)}
        title="New folder"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFolderModal(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createFolderMutation.mutate()} loading={createFolderMutation.isPending} disabled={!newFolderPath.trim()}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {currentFolderPath && (
            <p className="text-xs text-muted-foreground">
              Creating folder in: <span className="font-mono text-foreground">{currentFolderPath}</span>
            </p>
          )}
          <Input
            label="Folder name"
            value={newFolderPath}
            onChange={e => setNewFolderPath(e.target.value)}
            placeholder="e.g. src/components"
            autoFocus
          />
        </div>
      </Modal>

      <Modal
        open={fileModal}
        onClose={() => setFileModal(false)}
        title="New file"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFileModal(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createFileInFolderMutation.mutate()} loading={createFileInFolderMutation.isPending} disabled={!newFilePath.trim()}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {currentFilePath && (
            <p className="text-xs text-muted-foreground">
              Creating file in: <span className="font-mono text-foreground">{currentFilePath}</span>
            </p>
          )}
          <Input
            label="File name"
            value={newFilePath}
            onChange={e => setNewFilePath(e.target.value)}
            placeholder="e.g. index.tsx"
            autoFocus
          />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete file"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  )
}