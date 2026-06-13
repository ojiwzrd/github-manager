import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <p className="text-7xl font-bold text-foreground/10 mb-4">404</p>
      <h1 className="text-xl font-bold text-foreground mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard">
        <Button leftIcon={<Home className="h-4 w-4" />}>Go to Dashboard</Button>
      </Link>
    </div>
  )
}
