import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface DropdownItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
  separator?: boolean
}

interface DropdownProps {
  trigger: React.ReactElement
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export default function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative inline-flex" ref={ref}>
      {React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen((v) => !v)
        },
      })}
      {open && (
        <div className={cn(
          'absolute z-50 top-full mt-1 min-w-40 bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in',
          align === 'right' ? 'right-0' : 'left-0',
          className
        )}>
          <div className="py-1">
            {items.map((item, i) => {
              if (item.separator) {
                return <div key={i} className="my-1 h-px bg-border" />
              }
              return (
                <button
                  key={i}
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.()
                    setOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors',
                    item.variant === 'destructive'
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'text-foreground hover:bg-accent',
                    item.disabled && 'opacity-50 pointer-events-none'
                  )}
                >
                  {item.icon && <span className="shrink-0 text-muted-foreground">{item.icon}</span>}
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
