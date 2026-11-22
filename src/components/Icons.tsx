interface IconProps {
  size?: number
  className?: string
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export function IconChevronLeft({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function IconChevronRight({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function IconHeart({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

export function IconChart({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  )
}

export function IconCheck({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} strokeWidth={2.6}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export function IconLogout({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export function IconToday({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M8 2v4M16 2v4M3 10h18" />
      <circle cx="12" cy="15.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconMail({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <path d="M3 6.5l9 6.5 9-6.5" />
    </svg>
  )
}
