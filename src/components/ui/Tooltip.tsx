import React, { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactElement
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export default function Tooltip({ children, content, side = 'top', delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const show = () => {
    timer.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    clearTimeout(timer.current)
    setVisible(false)
  }

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <span className={cn(
          'absolute z-50 px-2 py-1 text-xs font-medium bg-foreground text-background rounded-md whitespace-nowrap pointer-events-none animate-fade-in',
          positions[side]
        )}>
          {content}
        </span>
      )}
    </span>
  )
}
