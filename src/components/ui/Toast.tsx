import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => dismiss(id), t.duration || 4000)
  }, [dismiss])

  const success = useCallback((title: string, description?: string) => toast({ type: 'success', title, description }), [toast])
  const error = useCallback((title: string, description?: string) => toast({ type: 'error', title, description }), [toast])
  const warning = useCallback((title: string, description?: string) => toast({ type: 'warning', title, description }), [toast])
  const info = useCallback((title: string, description?: string) => toast({ type: 'info', title, description }), [toast])

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

const icons: Record<ToastType, React.FC<{ className?: string }>> = {
  success: ({ className }) => <CheckCircle2 className={className} />,
  error: ({ className }) => <XCircle className={className} />,
  warning: ({ className }) => <AlertCircle className={className} />,
  info: ({ className }) => <Info className={className} />,
}

const colors: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-80">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 bg-card border border-border rounded-lg p-3 shadow-lg animate-fade-in"
          >
            <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', colors[t.type])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t.title}</p>
              {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
