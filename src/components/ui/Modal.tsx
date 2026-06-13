import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
}

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative z-10 w-full bg-card border border-border rounded-lg shadow-2xl animate-fade-in',
        sizes[size]
      )}>
        {(title || description) && (
          <div className="flex items-start justify-between p-4 border-b border-border">
            <div>
              {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
              {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 -mt-0.5 -mr-1">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 pt-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
