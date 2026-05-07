'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Coffee, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Cafés', Icon: Coffee },
  { href: '/roasters', label: 'Tostadores', Icon: Store },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-around px-8">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-8 py-2 transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70',
              )}
            >
              <Icon
                className={cn(
                  'size-5 stroke-[1.5] transition-transform duration-200',
                  isActive && 'scale-110',
                )}
              />
              <span
                className={cn(
                  'text-xs tracking-wide transition-all duration-200',
                  isActive ? 'font-semibold' : 'font-medium',
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  'h-1 w-1 rounded-full bg-primary transition-opacity duration-200',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
