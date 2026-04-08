import { cn } from '@/lib/utils'

interface GoogleIconProps {
  className?: string
}

export function GoogleIcon({ className }: GoogleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('h-4 w-4', className)}
    >
      <path
        fill="#4285F4"
        d="M21.805 12.23c0-.68-.061-1.333-.175-1.96H12v3.708h5.5a4.704 4.704 0 0 1-2.04 3.087v2.565h3.305c1.935-1.782 3.04-4.408 3.04-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.76 0 5.075-.915 6.766-2.47l-3.305-2.565c-.915.613-2.085.975-3.46.975-2.66 0-4.915-1.797-5.72-4.212H2.865v2.646A10.212 10.212 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC04"
        d="M6.28 13.728A6.138 6.138 0 0 1 5.96 11.9c0-.635.11-1.252.32-1.829V7.425H2.865a10.213 10.213 0 0 0 0 8.949l3.416-2.646Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.86c1.5 0 2.847.516 3.908 1.53l2.93-2.93C17.07 2.812 14.756 1.8 12 1.8A10.212 10.212 0 0 0 2.865 7.425L6.28 10.07C7.085 7.657 9.34 5.86 12 5.86Z"
      />
    </svg>
  )
}
