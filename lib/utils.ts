import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

export const randomSuffix = () => Math.random().toString(36).slice(2, 7)

export const genSubdomain = (name: string) => `${slugify(name)}-${randomSuffix()}`

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })

export const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const fmtTokens = (n: number) => n.toLocaleString()
