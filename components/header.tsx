'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Coffee, LogOut, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const TAB_PATHS = ['/', '/roasters']

function SearchInput({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [pathname, searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setValue(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (val) params.set('q', val)
      else params.delete('q')
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`)
    }, 250)
  }

  function clear() {
    setValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  const placeholder = pathname === '/roasters' ? 'Buscar tostadores…' : 'Buscar cafés…'

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.5] text-muted-foreground" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-9 border-transparent bg-muted/60 pl-9 pr-8 text-sm focus-visible:border-border focus-visible:bg-card"
      />
      {value && (
        <button
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const isTabPage = TAB_PATHS.includes(pathname)

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex h-12 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <Coffee className="size-4 stroke-[1.5]" />
            <span className="font-heading text-base font-medium tracking-tight">
              Coffee Corner
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4 stroke-[1.5]" />
          </Button>
        </div>

        {isTabPage && (
          <div className="pb-3">
            <Suspense
              fallback={
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.5] text-muted-foreground" />
                  <div className="h-9 rounded-md bg-muted/60" />
                </div>
              }
            >
              <SearchInput pathname={pathname} />
            </Suspense>
          </div>
        )}
      </div>
    </header>
  )
}
