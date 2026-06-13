import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Lock, Plus, Trash2, Eye, EyeOff, Variable, Key, Shield } from 'lucide-react'
import { githubService } from '@/lib/github'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import RepoSelector from '@/components/features/RepoSelector'
import { formatRelativeTime } from '@/lib/utils'
import type { Secret, Variable as VarType, Repository } from '@/types'

type TabType = 'secrets' | 'variables'

export default function SecretsPage() {
  const { success, error: toastError } = useToast()
  const queryClient = useQueryClient()
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('secrets')
  const [secretModalOpen, setSecretModalOpen] = useState(false)
  const [varModalOpen, setVarModalOpen] = useState(false)
  const [editVar, setEditVar] = useState<VarType | null>(null)
  const [newSecret, setNewSecret] = useState({ name: '', value: '' })
  const [newVar, setNewVar] = useState({ name: '', value: '' })

  const { data: secretsData, isLoading: secretsLoading } = useQuery({
    queryKey: ['secrets', selectedRepo?.full_name],
    queryFn: async () => {
      const data = await githubService.getSecrets(selectedRepo!.owner.login, selectedRepo!.name)
      return data.secrets as Secret[]
    },
    enabled: !!selectedRepo,
  })
  const secrets: Secret[] = secretsData || []

  const { data: varsData, isLoading: varsLoading } = useQuery({
    queryKey: ['variables', selectedRepo?.full_name],
    queryFn: async () => {
      const data = await githubService.getVariables(selectedRepo!.owner.login, selectedRepo!.name)
      return data.variables as VarType[]
    },
    enabled: !!selectedRepo,
  })
  const variables: VarType[] = varsData || []

  const deleteSecretMutation = useMutation({
    mutationFn: (name: string) => githubService.deleteSecret(selectedRepo!.owner.login, selectedRepo!.name, name),
    onSuccess: () => {
      success('Secret deleted')
      queryClient.invalidateQueries({ queryKey: ['secrets'] })
    },
    onError: (e: any) => toastError('Failed', e?.response?.data?.message),
  })

  const deleteVarMutation = useMutation({
    mutationFn: (name: string) => githubService.deleteVariable(selectedRepo!.owner.login, selectedRepo!.name, name),
    onSuccess: () => {
      success('Variable deleted')
      queryClient.invalidateQueries({ queryKey: ['variables'] })
    },
  })

  const createVarMutation = useMutation({
    mutationFn: () => editVar
      ? githubService.updateVariable(selectedRepo!.owner.login, selectedRepo!.name, newVar.name, newVar.value)
      : githubService.createVariable(selectedRepo!.owner.login, selectedRepo!.name, newVar.name, newVar.value),
    onSuccess: () => {
      success(editVar ? 'Variable updated' : 'Variable created')
      queryClient.invalidateQueries({ queryKey: ['variables'] })
      setVarModalOpen(false)
      setEditVar(null)
      setNewVar({ name: '', value: '' })
    },
    onError: (e: any) => toastError('Failed', e?.response?.data?.message),
  })

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Secrets & Variables</h1>
          <p className="text-sm text-muted-foreground">Manage repository secrets and configuration variables</p>
        </div>
        <Button
          size="md"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => activeTab === 'secrets' ? setSecretModalOpen(true) : setVarModalOpen(true)}
          disabled={!selectedRepo}
        >
          {activeTab === 'secrets' ? 'New secret' : 'New variable'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-72">
          <RepoSelector value={selectedRepo?.full_name} onChange={setSelectedRepo} />
        </div>
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setActiveTab('secrets')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${activeTab === 'secrets' ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Key className="h-3.5 w-3.5" /> Secrets
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${activeTab === 'variables' ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Variable className="h-3.5 w-3.5" /> Variables
          </button>
        </div>
      </div>

      {!selectedRepo ? (
        <EmptyState icon={Shield} title="Select a repository" description="Choose a repository to manage its secrets and variables" />
      ) : activeTab === 'secrets' ? (
        secretsLoading ? <SkeletonList /> : secrets.length === 0 ? (
          <EmptyState icon={Key} title="No secrets" description="Create your first secret to use in workflows" action={{ label: 'New secret', onClick: () => setSecretModalOpen(true) }} />
        ) : (
          <Card padding="none">
            <div className="divide-y divide-border">
              {secrets.map((secret) => (
                <div key={secret.name} className="flex items-center gap-4 px-4 py-3">
                  <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-mono font-medium text-foreground">{secret.name}</p>
                    <p className="text-xs text-muted-foreground">Updated {formatRelativeTime(secret.updated_at)}</p>
                  </div>
                  <Badge variant="default" size="sm">Encrypted</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSecretMutation.mutate(secret.name)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )
      ) : (
        varsLoading ? <SkeletonList /> : variables.length === 0 ? (
          <EmptyState icon={Variable} title="No variables" description="Create config variables for your workflows" action={{ label: 'New variable', onClick: () => setVarModalOpen(true) }} />
        ) : (
          <Card padding="none">
            <div className="divide-y divide-border">
              {variables.map((v) => (
                <div key={v.name} className="flex items-center gap-4 px-4 py-3">
                  <Variable className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-mono font-medium text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{v.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditVar(v); setNewVar({ name: v.name, value: v.value }); setVarModalOpen(true) }}
                    className="text-muted-foreground"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteVarMutation.mutate(v.name)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )
      )}

      {/* Secret Modal - Note: Real secret encryption requires libsodium */}
      <Modal
        open={secretModalOpen}
        onClose={() => setSecretModalOpen(false)}
        title="Add secret"
        footer={
          <>
            <Button variant="outline" onClick={() => setSecretModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toastError('Encryption required', 'Secret creation requires libsodium encryption. Use GitHub web UI for now.')
                setSecretModalOpen(false)
              }}
            >
              Add secret
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={newSecret.name} onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })} placeholder="MY_SECRET_KEY" className="font-mono" />
          <Input label="Value" type="password" value={newSecret.value} onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })} placeholder="Secret value" />
          <p className="text-xs text-muted-foreground">
            Secret values are encrypted with your repository's public key before being stored.
          </p>
        </div>
      </Modal>

      {/* Variable Modal */}
      <Modal
        open={varModalOpen}
        onClose={() => { setVarModalOpen(false); setEditVar(null); setNewVar({ name: '', value: '' }) }}
        title={editVar ? 'Edit variable' : 'New variable'}
        footer={
          <>
            <Button variant="outline" onClick={() => { setVarModalOpen(false); setEditVar(null) }}>Cancel</Button>
            <Button onClick={() => createVarMutation.mutate()} loading={createVarMutation.isPending}>
              {editVar ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={newVar.name} onChange={(e) => setNewVar({ ...newVar, name: e.target.value })} placeholder="MY_VARIABLE" className="font-mono" disabled={!!editVar} />
          <Input label="Value" value={newVar.value} onChange={(e) => setNewVar({ ...newVar, value: e.target.value })} placeholder="variable value" />
        </div>
      </Modal>
    </div>
  )
}
