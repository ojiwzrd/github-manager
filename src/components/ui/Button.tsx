import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variants = {
  default: 'bg-foreground text-background hover:bg-foreground/90 border-transparent',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border',
  ghost: 'bg-transparent text-foreground hover:bg-accent border-transparent',
  outline: 'bg-transparent text-foreground hover:bg-accent border-border',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-transparent',
  link: 'bg-transparent text-foreground underline-offset-4 hover:underline border-transparent p-0 h-auto',
}

const sizes = {
  sm: 'h-7 px-2.5 text-xs rounded-md gap-1.5',
  md: 'h-8 px-3 text-sm rounded-md gap-2',
  lg: 'h-10 px-4 text-sm rounded-md gap-2',
  icon: 'h-8 w-8 p-0 rounded-md',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
